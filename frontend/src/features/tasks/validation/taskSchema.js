import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be 120 characters or fewer'),
  description: z.string().trim().max(2000, 'Description must be 2000 characters or fewer'),
  priority: z.enum(['low', 'medium', 'high'], 'Choose a priority'),
  status: z.enum(['pending', 'in_progress', 'completed'], 'Choose a status'),
  dueDate: z.string().refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Enter a valid due date',
  }),
});

export function zodFormResolver(schema) {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field && !errors[field]) {
        errors[field] = { type: issue.code, message: issue.message };
      }
    });

    return { values: {}, errors };
  };
}
