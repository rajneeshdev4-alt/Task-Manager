import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { DashboardCharts } from '../features/tasks/components/DashboardCharts';
import { Pagination } from '../features/tasks/components/Pagination';
import { RecentTasks } from '../features/tasks/components/RecentTasks';
import { StatsGrid } from '../features/tasks/components/StatsGrid';
import { TaskDetail } from '../features/tasks/components/TaskDetail';
import { TaskFilters } from '../features/tasks/components/TaskFilters';
import { TaskForm } from '../features/tasks/components/TaskForm';
import { TaskList } from '../features/tasks/components/TaskList';
import { useTasks } from '../features/tasks/context/TaskContext';
import { toDateInputValue } from '../utils/dates';

export function Dashboard() {
  const {
    tasks,
    pagination,
    stats,
    loading,
    statsLoading,
    error,
    statsError,
    query,
    updateQuery,
    reloadTasks,
    reloadStats,
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
    getTask,
  } = useTasks();

  const [formMode, setFormMode] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setActiveTask(null);
    setFormMode('create');
  }

  function openEdit(task) {
    setDetail(null);
    setActiveTask(task);
    setFormMode('edit');
  }

  async function openDetail(task) {
    setDetail(task);
    setDetailLoading(true);
    try {
      const result = await getTask(task._id);
      setDetail(result.data);
    } catch (err) {
      toast.error(err.message || 'Unable to load task');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreate(values) {
    try {
      await createTask(values);
      setFormMode(null);
    } catch (err) {
      toast.error(err.message || 'Unable to create task');
      throw err;
    }
  }

  async function handleUpdate(values) {
    try {
      await updateTask(activeTask._id, values);
      setFormMode(null);
      setActiveTask(null);
    } catch (err) {
      toast.error(err.message || 'Unable to update task');
      throw err;
    }
  }

  async function handleStatusChange(task, status) {
    if (task.status === status) return;
    setBusyId(task._id);
    try {
      await updateStatus(task._id, status);
    } catch (err) {
      toast.error(err.message || 'Unable to update status');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteTask(pendingDelete._id);
      setPendingDelete(null);
    } catch (err) {
      toast.error(err.message || 'Unable to delete task');
    } finally {
      setDeleting(false);
    }
  }

  const filtersActive = Boolean(query.search || query.status || query.priority || query.overdue);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Create tasks, track deadlines, and see what needs attention.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Add task
        </Button>
      </div>

      {statsError ? <ErrorState message={statsError} onRetry={reloadStats} /> : <StatsGrid stats={stats} loading={statsLoading} />}

      <div className="mt-6 space-y-4">
        <TaskFilters />
        <div className="grid items-start gap-4 min-[1440px]:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-4">
          {error ? (
            <ErrorState message={error} onRetry={reloadTasks} />
          ) : !loading && tasks.length === 0 ? (
            <EmptyState
              title={filtersActive ? 'No tasks match these filters' : 'No tasks yet'}
              description={
                filtersActive
                  ? 'Try a different search or reset the filters to see the full list.'
                  : 'Add the first task to start tracking work in this workspace.'
              }
              action={
                filtersActive ? null : (
                  <Button onClick={openCreate}>
                    <Plus size={16} />
                    Add task
                  </Button>
                )
              }
            />
          ) : (
            <section>
              {!loading && pagination ? (
                <p className="mb-3 text-sm text-slate-500">
                  Showing {tasks.length} of {pagination.total} tasks
                </p>
              ) : null}
              <TaskList
                tasks={tasks}
                loading={loading}
                busyId={busyId}
                onView={openDetail}
                onEdit={openEdit}
                onDelete={setPendingDelete}
                onStatusChange={handleStatusChange}
              />
              <Pagination pagination={pagination} onPageChange={(page) => updateQuery({ page }, { resetPage: false })} />
            </section>
          )}
          </div>
          <RecentTasks tasks={stats?.recent || []} onSelect={openDetail} />
        </div>
      </div>

      <div className="mt-4">
        <DashboardCharts stats={stats} />
      </div>

      <Modal
        open={formMode === 'create'}
        title="Add task"
        description="Title is required. Everything else can be filled in later."
        onClose={() => setFormMode(null)}
      >
        <TaskForm submitLabel="Create task" onSubmit={handleCreate} onCancel={() => setFormMode(null)} />
      </Modal>

      <Modal
        open={formMode === 'edit'}
        title="Edit task"
        description="Updates are saved to the database immediately."
        onClose={() => setFormMode(null)}
      >
        <TaskForm
          submitLabel="Save changes"
          initialValues={{
            title: activeTask?.title || '',
            description: activeTask?.description || '',
            priority: activeTask?.priority || 'medium',
            status: activeTask?.status || 'pending',
            dueDate: toDateInputValue(activeTask?.dueDate),
          }}
          onSubmit={handleUpdate}
          onCancel={() => setFormMode(null)}
        />
      </Modal>

      <Modal
        open={Boolean(detail)}
        title={detail?.title || 'Task'}
        description={detailLoading ? 'Loading the latest task details...' : 'Stored task record'}
        onClose={() => setDetail(null)}
      >
        <TaskDetail task={detail} onClose={() => setDetail(null)} onEdit={openEdit} />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this task?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be removed permanently. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete task"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </AppShell>
  );
}
