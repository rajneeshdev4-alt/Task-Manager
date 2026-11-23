import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatDateTime, formatDisplayDate, isOverdue } from '../../../utils/dates';

export function TaskDetail({ task, onEdit, onClose }) {
  if (!task) return null;
  const overdue = isOverdue(task);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge kind="priority" value={task.priority} />
        <Badge kind="status" value={task.status} />
        {overdue ? (
          <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
            Overdue
          </span>
        ) : null}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {task.description || 'No description added.'}
      </p>
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <dt className="text-slate-500">Due date</dt>
          <dd className="mt-1 font-medium text-slate-900">{task.dueDate ? formatDisplayDate(task.dueDate) : 'Not set'}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <dt className="text-slate-500">Created</dt>
          <dd className="mt-1 font-medium text-slate-900">{formatDateTime(task.createdAt)}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 sm:col-span-2">
          <dt className="text-slate-500">Last updated</dt>
          <dd className="mt-1 font-medium text-slate-900">{formatDateTime(task.updatedAt)}</dd>
        </div>
      </dl>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => onEdit(task)}>Edit task</Button>
      </div>
    </div>
  );
}
