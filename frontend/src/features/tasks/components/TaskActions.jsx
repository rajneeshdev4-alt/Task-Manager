import { Check, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { formatDisplayDate, isOverdue } from '../../../utils/dates';
import { STATUS_OPTIONS } from '../../../utils/labels';

export function TaskActions({ task, onView, onEdit, onDelete, onStatusChange, busy, className = '' }) {
  return (
    <div className={`flex flex-nowrap items-center gap-2 ${className}`}>
      <select
        id={`status-${task._id}`}
        aria-label={`Status for ${task.title}`}
        value={task.status}
        disabled={busy}
        onChange={(event) => onStatusChange(task, event.target.value)}
        className="h-8 w-[8.75rem] shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      <div className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        <Button size="icon" variant="ghost" aria-label={`View ${task.title}`} onClick={() => onView(task)}>
          <Eye size={16} />
        </Button>
        <Button size="icon" variant="ghost" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}>
          <Pencil size={16} />
        </Button>
        <Button size="icon" variant="ghost" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}>
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}

export function TaskMeta({ task, stacked = false }) {
  const overdue = isOverdue(task);
  const dueLabel = task.dueDate ? formatDisplayDate(task.dueDate) : 'Not set';

  if (stacked) {
    return (
      <div className="space-y-1 text-xs leading-4">
        <p className={`whitespace-nowrap ${overdue ? 'font-medium text-rose-600' : 'text-slate-700'}`}>
          <span className="text-slate-400">Due </span>
          {dueLabel}
          {overdue ? ' · Overdue' : ''}
        </p>
        <p className="whitespace-nowrap text-slate-500">
          <span className="text-slate-400">Created </span>
          {formatDisplayDate(task.createdAt)}
        </p>
        <p className="whitespace-nowrap text-slate-500">
          <span className="text-slate-400">Updated </span>
          {formatDisplayDate(task.updatedAt)}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 grid gap-1 text-xs text-slate-500">
      <span className={overdue ? 'font-medium text-rose-600' : ''}>
        Due {dueLabel}
        {overdue ? ' · Overdue' : ''}
      </span>
      <span>Created {formatDisplayDate(task.createdAt)}</span>
      <span>Updated {formatDisplayDate(task.updatedAt)}</span>
    </div>
  );
}
