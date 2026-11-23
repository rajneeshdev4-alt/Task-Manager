import { Badge } from '../../../components/ui/Badge';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { TaskActions, TaskMeta } from './TaskActions';

function SkeletonRows() {
  return Array.from({ length: 4 }).map((_, index) => (
    <div key={index} className="animate-pulse border-b border-slate-100 px-4 py-4">
      <div className="h-4 w-1/3 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
    </div>
  ));
}

export function TaskList({ tasks, loading, onView, onEdit, onDelete, onStatusChange, busyId }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-busy="true">
        <SkeletonRows />
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <div className="grid gap-3">
        {tasks.map((task) => (
          <article key={task._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge kind="priority" value={task.priority} />
              <Badge kind="status" value={task.status} />
            </div>
            <button type="button" className="mt-3 text-left text-base font-semibold text-slate-900" onClick={() => onView(task)}>
              {task.title}
            </button>
            <p className="mt-1 text-sm text-slate-500">{task.description || 'No description'}</p>
            <TaskMeta task={task} />
            <div className="mt-4">
              <TaskActions
                task={task}
                busy={busyId === task._id}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dates</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} className="border-t border-slate-100 align-top">
                <td className="max-w-xs px-4 py-4">
                  <button
                    type="button"
                    className="text-left text-sm font-semibold text-slate-900 hover:underline"
                    onClick={() => onView(task)}
                  >
                    {task.title}
                  </button>
                  {task.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-400">No description</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <Badge kind="priority" value={task.priority} />
                </td>
                <td className="px-4 py-4">
                  <Badge kind="status" value={task.status} />
                </td>
                <td className="px-4 py-4">
                  <TaskMeta task={task} />
                </td>
                <td className="px-4 py-4">
                  <TaskActions
                    task={task}
                    busy={busyId === task._id}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
