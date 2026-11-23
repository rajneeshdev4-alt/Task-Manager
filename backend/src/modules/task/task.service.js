const { Task } = require('./task.model');
const { PRIORITY_ORDER, PUBLIC_FIELDS } = require('./task.constants');
const { ApiError } = require('../../utils/ApiError');

const SORT_FIELD_MAP = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  dueDate: 'dueDate',
  priority: 'priorityOrder',
  title: 'title',
};

function assertObjectId(id) {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw new ApiError(400, 'Invalid task id');
  }
}

function normalizeDueDate(value) {
  if (value == null || value === '') {
    return null;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T23:59:59.999Z`);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, 'Due date must be a valid date');
  }
  return date;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildFilter(query) {
  const filter = {};

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  if (query.overdue === 'true') {
    filter.dueDate = { $ne: null, $lt: new Date() };
    if (query.status === 'completed') {
      filter.status = { $in: [] };
    } else if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = { $ne: 'completed' };
    }
  } else if (query.status) {
    filter.status = query.status;
  }

  return filter;
}

function buildPagination(page, limit, total) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1 && totalPages > 0,
  };
}

function toPublicTask(task) {
  if (!task) return task;
  const { priorityOrder, ...rest } = task;
  return rest;
}

async function createTask(payload) {
  const task = await Task.create({
    title: payload.title,
    description: payload.description ?? '',
    priority: payload.priority,
    priorityOrder: PRIORITY_ORDER[payload.priority],
    status: payload.status,
    dueDate: normalizeDueDate(payload.dueDate),
  });

  return toPublicTask(task.toObject());
}

async function listTasks(query) {
  const filter = buildFilter(query);
  const sortField = SORT_FIELD_MAP[query.sortBy] || 'createdAt';
  const direction = query.sortOrder === 'asc' ? 1 : -1;
  const skip = (query.page - 1) * query.limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .select(sortField === 'priorityOrder' ? `${PUBLIC_FIELDS} priorityOrder` : PUBLIC_FIELDS)
      .sort({ [sortField]: direction, _id: direction })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    tasks: tasks.map(toPublicTask),
    pagination: buildPagination(query.page, query.limit, total),
  };
}

async function getTaskById(id) {
  assertObjectId(id);
  const task = await Task.findById(id).select(PUBLIC_FIELDS).lean();
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  return task;
}

async function updateTask(id, payload) {
  assertObjectId(id);

  const updates = { ...payload };
  if (Object.prototype.hasOwnProperty.call(payload, 'dueDate')) {
    updates.dueDate = normalizeDueDate(payload.dueDate);
  }
  if (payload.priority) {
    updates.priorityOrder = PRIORITY_ORDER[payload.priority];
  }

  const task = await Task.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .select(PUBLIC_FIELDS)
    .lean();

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return task;
}

async function updateTaskStatus(id, status) {
  return updateTask(id, { status });
}

async function deleteTask(id) {
  assertObjectId(id);
  const task = await Task.findByIdAndDelete(id).select(PUBLIC_FIELDS).lean();
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  return task;
}

function fillCountMap(rows, keys) {
  const map = Object.fromEntries(keys.map((key) => [key, 0]));
  rows.forEach((row) => {
    if (row._id && Object.prototype.hasOwnProperty.call(map, row._id)) {
      map[row._id] = row.count;
    }
  });
  return map;
}

async function getTaskStats() {
  const now = new Date();
  const [result] = await Task.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        overdue: [
          {
            $match: {
              dueDate: { $ne: null, $lt: now },
              status: { $ne: 'completed' },
            },
          },
          { $count: 'count' },
        ],
        monthly: [
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ],
        recent: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              title: 1,
              status: 1,
              priority: 1,
              dueDate: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);

  const byStatus = fillCountMap(result?.byStatus || [], ['pending', 'in_progress', 'completed']);
  const byPriority = fillCountMap(result?.byPriority || [], ['low', 'medium', 'high']);
  const total = result?.total?.[0]?.count || 0;

  const monthly = (result?.monthly || []).map((row) => ({
    year: row._id.year,
    month: row._id.month,
    label: new Date(Date.UTC(row._id.year, row._id.month - 1, 1)).toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }),
    count: row.count,
  }));

  return {
    summary: {
      total,
      pending: byStatus.pending,
      inProgress: byStatus.in_progress,
      completed: byStatus.completed,
      overdue: result?.overdue?.[0]?.count || 0,
    },
    statusDistribution: [
      { status: 'pending', label: 'Pending', count: byStatus.pending },
      { status: 'in_progress', label: 'In Progress', count: byStatus.in_progress },
      { status: 'completed', label: 'Completed', count: byStatus.completed },
    ],
    priorityDistribution: [
      { priority: 'low', label: 'Low', count: byPriority.low },
      { priority: 'medium', label: 'Medium', count: byPriority.medium },
      { priority: 'high', label: 'High', count: byPriority.high },
    ],
    monthly,
    recent: result?.recent || [],
  };
}

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
  buildFilter,
  normalizeDueDate,
};
