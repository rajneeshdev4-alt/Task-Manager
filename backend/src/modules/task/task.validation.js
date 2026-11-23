const { z } = require('zod');
const { PRIORITIES, STATUSES, SORTABLE_FIELDS } = require('./task.constants');

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid task id');

const dueDateSchema = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.union(
    [
      z.null(),
      z.iso.datetime(),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ],
    'Due date must be a valid date'
  )
);

const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(120, 'Title must be 120 characters or fewer'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description must be 2000 characters or fewer')
      .optional()
      .default(''),
    priority: z
      .enum(PRIORITIES, 'Priority must be low, medium, or high')
      .optional()
      .default('medium'),
    status: z
      .enum(STATUSES, 'Status must be pending, in_progress, or completed')
      .optional()
      .default('pending'),
    dueDate: dueDateSchema.optional().default(null),
  })
  .strict();

const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(120, 'Title must be 120 characters or fewer')
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, 'Description must be 2000 characters or fewer')
      .optional(),
    priority: z.enum(PRIORITIES, 'Priority must be low, medium, or high').optional(),
    status: z.enum(STATUSES, 'Status must be pending, in_progress, or completed').optional(),
    dueDate: dueDateSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  });

const updateStatusSchema = z
  .object({
    status: z.enum(STATUSES, 'Status must be pending, in_progress, or completed'),
  })
  .strict();

const taskIdSchema = z.object({
  id: objectIdSchema,
});

const listTasksSchema = z.object({
  search: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(100, 'Search must be 100 characters or fewer').optional()
  ),
  status: z.enum(STATUSES, 'Status must be pending, in_progress, or completed').optional(),
  priority: z.enum(PRIORITIES, 'Priority must be low, medium, or high').optional(),
  overdue: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(10),
  sortBy: z.enum(SORTABLE_FIELDS, 'Sort field is not allowed').default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'], 'Sort order must be asc or desc').default('desc'),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  taskIdSchema,
  listTasksSchema,
};
