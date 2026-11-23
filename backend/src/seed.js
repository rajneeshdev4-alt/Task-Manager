require('dotenv').config();

const { connectDatabase, disconnectDatabase } = require('./config/database');
const { Task } = require('./modules/task/task.model');

const samples = [
  {
    title: 'Prepare sprint demo',
    description: 'Walk through the task dashboard and API filters.',
    priority: 'high',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  },
  {
    title: 'Write API notes',
    description: 'Document pagination, sorting, and validation decisions.',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Review pull request checklist',
    description: 'Check error handling and empty states.',
    priority: 'low',
    status: 'completed',
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Design empty states',
    description: 'Keep the first-run dashboard useful when there are no tasks.',
    priority: 'medium',
    status: 'pending',
    dueDate: null,
    createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Confirm mobile layout',
    description: 'Cards should replace the table on a narrow screen.',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

async function seed() {
  await connectDatabase(process.env.MONGODB_URI);
  const existing = await Task.countDocuments();
  if (existing > 0) {
    console.log(`Skipped seed. ${existing} task(s) already exist.`);
    await disconnectDatabase();
    return;
  }

  await Task.create(samples);
  console.log(`Inserted ${samples.length} sample tasks.`);
  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
