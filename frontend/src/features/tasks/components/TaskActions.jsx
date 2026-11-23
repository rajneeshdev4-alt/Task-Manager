import { Check, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { SelectField } from '../../../components/ui/SelectField';
import { formatDisplayDate, isOverdue } from '../../../utils/dates';
import { STATUS_OPTIONS } from '../../../utils/labels';

export function TaskActions({ task, onView, onEdit, onDelete, onStatusChange, busy }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-36">
        <SelectField
          id={`status-${task._id}`}
          aria-label={`Status for ${task.title}`}
          value={task.status}
          disabled={busy}
          onChange={(event) => onStatusChange(task, event.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>
      {task.status !== 'completed' ? (
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => onStatusChange(task, 'completed')}>
          <Check size={14} />
          Complete
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" aria-label={`View ${task.title}`} onClick={() => onView(task)}>
        View
      </Button>
      <Button size="icon" variant="ghost" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}>
        <Pencil size={16} />
      </Button>
      <Button size="icon" variant="ghost" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}>
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

export function TaskMeta({ task }) {
  const overdue = isOverdue(task);
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
      <span className={overdue ? 'font-medium text-rose-600' : ''}>
        Due {task.dueDate ? formatDisplayDate(task.dueDate) : 'not set'}
        {overdue ? ' · Overdue' : ''}
      </span>
      <span>Created {formatDisplayDate(task.createdAt)}</span>
      <span>Updated {formatDisplayDate(task.updatedAt)}</span>
    </div>
  );
}
