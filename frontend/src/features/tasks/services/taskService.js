import { api } from '../../../services/api';

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
}

export const taskService = {
  async listTasks(params) {
    const response = await api.get('/tasks', { params: cleanParams(params) });
    return response.data;
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/tasks/stats');
    return response.data;
  },

  async createTask(payload) {
    const response = await api.post('/tasks', payload);
    return response.data;
  },

  async updateTask(id, payload) {
    const response = await api.put(`/tasks/${id}`, payload);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};
