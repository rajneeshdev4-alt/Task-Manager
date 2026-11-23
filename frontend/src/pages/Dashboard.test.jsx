import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { App } from '../app/App';
import { taskService } from '../features/tasks/services/taskService';

vi.mock('../features/tasks/services/taskService', () => ({
  taskService: {
    listTasks: vi.fn(),
    getStats: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    updateStatus: vi.fn(),
    deleteTask: vi.fn(),
    getTask: vi.fn(),
  },
}));

const task = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Prepare release notes',
  description: 'Summarize the dashboard changes',
  priority: 'high',
  status: 'pending',
  dueDate: '2026-12-01T23:59:59.999Z',
  createdAt: '2026-11-20T10:00:00.000Z',
  updatedAt: '2026-11-21T10:00:00.000Z',
};

const stats = {
  summary: { total: 1, pending: 1, inProgress: 0, completed: 0, overdue: 0 },
  statusDistribution: [
    { status: 'pending', label: 'Pending', count: 1 },
    { status: 'in_progress', label: 'In Progress', count: 0 },
    { status: 'completed', label: 'Completed', count: 0 },
  ],
  priorityDistribution: [
    { priority: 'low', label: 'Low', count: 0 },
    { priority: 'medium', label: 'Medium', count: 0 },
    { priority: 'high', label: 'High', count: 1 },
  ],
  monthly: [{ year: 2026, month: 11, label: 'Nov 2026', count: 1 }],
  recent: [task],
};

function mockLoadedList(tasks = [task], pagination) {
  taskService.listTasks.mockResolvedValue({
    data: tasks,
    pagination: pagination || {
      page: 1,
      limit: 8,
      total: tasks.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  });
  taskService.getStats.mockResolvedValue({ data: stats });
  taskService.getTask.mockResolvedValue({ data: task });
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  test('renders the dashboard and task list', async () => {
    mockLoadedList();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Prepare release notes' })).toBeInTheDocument();
    expect(screen.getByText('Total tasks')).toBeInTheDocument();
    expect(screen.getByText('Recent tasks')).toBeInTheDocument();
  });

  test('shows a loading state before tasks arrive', async () => {
    let resolveList;
    taskService.listTasks.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveList = resolve;
        })
    );
    taskService.getStats.mockResolvedValue({ data: stats });

    render(<App />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();

    resolveList({
      data: [task],
      pagination: { page: 1, limit: 8, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    });
    expect((await screen.findAllByText('Prepare release notes')).length).toBeGreaterThan(0);
  });

  test('shows an error state and retries', async () => {
    taskService.listTasks.mockRejectedValueOnce({ message: 'Unable to load tasks' });
    taskService.getStats.mockResolvedValue({ data: stats });
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load tasks');
    mockLoadedList();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect((await screen.findAllByText('Prepare release notes')).length).toBeGreaterThan(0);
  });

  test('validates the create form before calling the API', async () => {
    mockLoadedList();
    const user = userEvent.setup();
    render(<App />);
    await screen.findAllByText('Prepare release notes');

    await user.click(screen.getAllByRole('button', { name: 'Add task' })[0]);
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  test('creates a task from the modal', async () => {
    mockLoadedList();
    taskService.createTask.mockResolvedValue({ data: task });
    const user = userEvent.setup();
    render(<App />);
    await screen.findAllByText('Prepare release notes');

    await user.click(screen.getAllByRole('button', { name: 'Add task' })[0]);
    await user.type(screen.getByLabelText('Title'), 'Call the client');
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Call the client', priority: 'medium', status: 'pending' })
      );
    });
  });

  test('edits a task', async () => {
    mockLoadedList();
    taskService.updateTask.mockResolvedValue({ data: { ...task, title: 'Updated notes' } });
    const user = userEvent.setup();
    render(<App />);
    await screen.findAllByText('Prepare release notes');

    await user.click(screen.getAllByRole('button', { name: 'Edit Prepare release notes' })[0]);
    const title = screen.getByLabelText('Title');
    await user.clear(title);
    await user.type(title, 'Updated notes');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(taskService.updateTask).toHaveBeenCalledWith(
        task._id,
        expect.objectContaining({ title: 'Updated notes' })
      );
    });
  });

  test('asks for confirmation before deleting', async () => {
    mockLoadedList();
    taskService.deleteTask.mockResolvedValue({ data: task });
    const user = userEvent.setup();
    render(<App />);
    await screen.findAllByText('Prepare release notes');

    await user.click(screen.getAllByRole('button', { name: 'Delete Prepare release notes' })[0]);
    expect(screen.getByRole('dialog', { name: 'Delete this task?' })).toBeInTheDocument();
    expect(taskService.deleteTask).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Delete task' }));
    await waitFor(() => expect(taskService.deleteTask).toHaveBeenCalledWith(task._id));
  });

  test('sends search and status filters to the API', async () => {
    mockLoadedList();
    const user = userEvent.setup();
    render(<App />);
    await screen.findAllByText('Prepare release notes');

    await user.type(screen.getByLabelText('Search'), 'release');
    await waitFor(() => {
      expect(taskService.listTasks).toHaveBeenCalledWith(expect.objectContaining({ search: 'release' }));
    });

    await user.selectOptions(screen.getByLabelText('Status'), 'pending');
    await waitFor(() => {
      expect(taskService.listTasks).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'release', status: 'pending' })
      );
    });
  });

  test('shows the empty state when the list is empty', async () => {
    mockLoadedList([]);
    render(<App />);
    expect(await screen.findByText('No tasks yet')).toBeInTheDocument();
    expect(within(screen.getByRole('main') || document.body).getByText('No tasks yet')).toBeInTheDocument();
  });
});
