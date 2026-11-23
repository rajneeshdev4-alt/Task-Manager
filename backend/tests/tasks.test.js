const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:5173';
// Default 8.x binaries abort on macOS 12. 7.0 still starts on this machine.
process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.14';

const { createApp } = require('../src/app');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const { Task } = require('../src/modules/task/task.model');

let mongoServer;
let app;

const baseTask = {
  title: 'Ship dashboard',
  description: 'Status charts and recent tasks',
  priority: 'high',
  status: 'pending',
  dueDate: '2026-12-01',
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDatabase(mongoServer.getUri());
  app = createApp();
}, 120000);

afterEach(async () => {
  await Task.deleteMany({});
});

afterAll(async () => {
  await disconnectDatabase();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

describe('Task API', () => {
  test('creates a task', async () => {
    const response = await request(app).post('/api/v1/tasks').send(baseTask);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Ship dashboard');
    expect(response.body.data.priority).toBe('high');
    expect(response.body.data.status).toBe('pending');
    expect(response.body.data.createdAt).toBeTruthy();
    expect(response.body.data.updatedAt).toBeTruthy();
    expect(response.body.data.priorityOrder).toBeUndefined();
  });

  test('rejects a missing title', async () => {
    const response = await request(app).post('/api/v1/tasks').send({ description: 'No title' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.some((error) => error.field === 'title')).toBe(true);
  });

  test('rejects invalid priority and status', async () => {
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({ title: 'Bad enums', priority: 'urgent', status: 'done' });

    expect(response.status).toBe(400);
    expect(response.body.errors.map((error) => error.field).sort()).toEqual(['priority', 'status']);
  });

  test('lists tasks with pagination', async () => {
    await Task.create([
      { title: 'Alpha', priority: 'low', status: 'pending' },
      { title: 'Beta', priority: 'medium', status: 'in_progress' },
      { title: 'Gamma', priority: 'high', status: 'completed' },
    ]);

    const response = await request(app).get('/api/v1/tasks?page=1&limit=2&sortBy=title&sortOrder=asc');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].title).toBe('Alpha');
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
      hasNextPage: true,
      hasPrevPage: false,
    });
  });

  test('filters by search, status, priority, and overdue together', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await Task.create([
      {
        title: 'Client meeting notes',
        description: 'Prepare agenda',
        priority: 'high',
        status: 'pending',
        dueDate: yesterday,
      },
      {
        title: 'Client meeting follow-up',
        description: 'Send recap',
        priority: 'high',
        status: 'completed',
        dueDate: yesterday,
      },
      {
        title: 'Client meeting rehearsal',
        description: 'Dry run',
        priority: 'low',
        status: 'pending',
        dueDate: tomorrow,
      },
    ]);

    const response = await request(app).get(
      '/api/v1/tasks?search=meeting&status=pending&priority=high&overdue=true'
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('Client meeting notes');
  });

  test('searches descriptions and rejects unknown sort fields', async () => {
    await Task.create({
      title: 'Ops',
      description: 'Quarterly budget review',
      priority: 'medium',
      status: 'pending',
    });

    const found = await request(app).get('/api/v1/tasks?search=budget');
    expect(found.body.data).toHaveLength(1);

    const invalidSort = await request(app).get('/api/v1/tasks?sortBy=$where');
    expect(invalidSort.status).toBe(400);
  });

  test('sorts by priority from low to high', async () => {
    await Task.create([
      { title: 'High', priority: 'high', status: 'pending' },
      { title: 'Low', priority: 'low', status: 'pending' },
      { title: 'Medium', priority: 'medium', status: 'pending' },
    ]);

    const response = await request(app).get('/api/v1/tasks?sortBy=priority&sortOrder=asc');
    expect(response.body.data.map((task) => task.priority)).toEqual(['low', 'medium', 'high']);
  });

  test('retrieves, updates, changes status, and deletes a task', async () => {
    const created = await request(app).post('/api/v1/tasks').send(baseTask);
    const id = created.body.data._id;

    const fetched = await request(app).get(`/api/v1/tasks/${id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.title).toBe('Ship dashboard');

    const updated = await request(app)
      .put(`/api/v1/tasks/${id}`)
      .send({ title: 'Ship analytics', priority: 'low', dueDate: null });
    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe('Ship analytics');
    expect(updated.body.data.priority).toBe('low');
    expect(updated.body.data.dueDate).toBeNull();

    const status = await request(app).patch(`/api/v1/tasks/${id}/status`).send({ status: 'completed' });
    expect(status.status).toBe(200);
    expect(status.body.data.status).toBe('completed');

    const removed = await request(app).delete(`/api/v1/tasks/${id}`);
    expect(removed.status).toBe(200);

    const missing = await request(app).get(`/api/v1/tasks/${id}`);
    expect(missing.status).toBe(404);
    expect(missing.body.message).toBe('Task not found');
  });

  test('handles invalid and nonexistent ids', async () => {
    const invalid = await request(app).get('/api/v1/tasks/not-an-id');
    expect(invalid.status).toBe(400);
    expect(invalid.body.message).toBe('Validation failed');

    const missing = await request(app).delete(`/api/v1/tasks/${new mongoose.Types.ObjectId()}`);
    expect(missing.status).toBe(404);
  });

  test('returns dashboard statistics from stored tasks', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Task.create([
      { title: 'A', priority: 'high', status: 'pending', dueDate: yesterday },
      { title: 'B', priority: 'low', status: 'in_progress' },
      { title: 'C', priority: 'medium', status: 'completed', dueDate: yesterday },
    ]);

    const response = await request(app).get('/api/v1/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body.data.summary).toEqual({
      total: 3,
      pending: 1,
      inProgress: 1,
      completed: 1,
      overdue: 1,
    });
    expect(response.body.data.statusDistribution).toHaveLength(3);
    expect(response.body.data.priorityDistribution).toHaveLength(3);
    expect(response.body.data.recent).toHaveLength(3);
    expect(response.body.data.monthly.length).toBeGreaterThan(0);
  });

  test('returns an empty statistics payload when there are no tasks', async () => {
    const response = await request(app).get('/api/v1/tasks/stats');
    expect(response.body.data.summary.total).toBe(0);
    expect(response.body.data.recent).toEqual([]);
    expect(response.body.data.monthly).toEqual([]);
  });
});
