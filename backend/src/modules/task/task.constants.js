const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['pending', 'in_progress', 'completed'];
const PRIORITY_ORDER = { low: 1, medium: 2, high: 3 };
const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'];

const PUBLIC_FIELDS = 'title description priority status dueDate createdAt updatedAt';

module.exports = {
  PRIORITIES,
  STATUSES,
  PRIORITY_ORDER,
  SORTABLE_FIELDS,
  PUBLIC_FIELDS,
};
