import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';

const TaskContext = createContext(null);

const DEFAULT_QUERY = {
  search: '',
  status: '',
  priority: '',
  overdue: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 8,
};

function readQuery(searchParams) {
  return {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    overdue: searchParams.get('overdue') === 'true' ? 'true' : '',
    sortBy: searchParams.get('sortBy') || DEFAULT_QUERY.sortBy,
    sortOrder: searchParams.get('sortOrder') || DEFAULT_QUERY.sortOrder,
    page: Number(searchParams.get('page') || 1),
    limit: DEFAULT_QUERY.limit,
  };
}

export function TaskProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => readQuery(searchParams), [searchParams]);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statsError, setStatsError] = useState('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await taskService.listTasks(query);
      setTasks(result.data || []);
      setPagination(result.pagination || null);
    } catch (err) {
      setTasks([]);
      setPagination(null);
      setError(err.message || 'Unable to load tasks');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const result = await taskService.getStats();
      setStats(result.data);
    } catch (err) {
      setStats(null);
      setStatsError(err.message || 'Unable to load dashboard statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const updateQuery = useCallback(
    (partial, { resetPage = true } = {}) => {
      const next = { ...query, ...partial };
      if (resetPage && partial.page === undefined) {
        next.page = 1;
      }

      const params = {};
      Object.entries(next).forEach(([key, value]) => {
        if (key === 'limit') return;
        if (value === '' || value === undefined || value === null) return;
        if (key === 'sortBy' && value === DEFAULT_QUERY.sortBy) return;
        if (key === 'sortOrder' && value === DEFAULT_QUERY.sortOrder) return;
        if (key === 'page' && Number(value) === 1) return;
        params[key] = String(value);
      });
      setSearchParams(params);
    },
    [query, setSearchParams]
  );

  const resetQuery = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const refresh = useCallback(async () => {
    await Promise.all([loadTasks(), loadStats()]);
  }, [loadTasks, loadStats]);

  const createTask = useCallback(
    async (payload) => {
      const result = await taskService.createTask(payload);
      toast.success('Task created');
      await refresh();
      return result.data;
    },
    [refresh]
  );

  const updateTask = useCallback(
    async (id, payload) => {
      const result = await taskService.updateTask(id, payload);
      toast.success('Task updated');
      await refresh();
      return result.data;
    },
    [refresh]
  );

  const updateStatus = useCallback(
    async (id, status) => {
      const result = await taskService.updateStatus(id, status);
      toast.success(status === 'completed' ? 'Task marked complete' : 'Status updated');
      await refresh();
      return result.data;
    },
    [refresh]
  );

  const deleteTask = useCallback(
    async (id) => {
      await taskService.deleteTask(id);
      toast.success('Task deleted');
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      tasks,
      pagination,
      stats,
      loading,
      statsLoading,
      error,
      statsError,
      query,
      updateQuery,
      resetQuery,
      refresh,
      reloadTasks: loadTasks,
      reloadStats: loadStats,
      createTask,
      updateTask,
      updateStatus,
      deleteTask,
      getTask: taskService.getTask,
    }),
    [
      tasks,
      pagination,
      stats,
      loading,
      statsLoading,
      error,
      statsError,
      query,
      updateQuery,
      resetQuery,
      refresh,
      loadTasks,
      loadStats,
      createTask,
      updateTask,
      updateStatus,
      deleteTask,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
}
