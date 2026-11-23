import { Badge } from '../../../components/ui/Badge';
import { formatDisplayDate } from '../../../utils/dates';

export function RecentTasks({ tasks = [], onSelect }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Recent tasks</h3>
      {tasks.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">New tasks will show up here.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {tasks.map((task) => (
            <li key={task._id}>
              <button
                type="button"
                onClick={() => onSelect(task)}
                className="flex w-full items-start justify-between gap-3 py-3 text-left"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-900">{task.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Created {formatDisplayDate(task.createdAt)}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <Badge kind="status" value={task.status} />
                  <Badge kind="priority" value={task.priority} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
