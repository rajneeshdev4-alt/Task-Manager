const taskService = require('./task.service');
const { sendSuccess } = require('../../utils/ApiResponse');
const { asyncHandler } = require('../../utils/asyncHandler');

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.validated.body);
  return sendSuccess(res, 201, 'Task created successfully', task);
});

const listTasks = asyncHandler(async (req, res) => {
  const { tasks, pagination } = await taskService.listTasks(req.validated.query);
  return sendSuccess(res, 200, 'Tasks retrieved successfully', tasks, pagination);
});

const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.validated.params.id);
  return sendSuccess(res, 200, 'Task retrieved successfully', task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.validated.params.id, req.validated.body);
  return sendSuccess(res, 200, 'Task updated successfully', task);
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskStatus(
    req.validated.params.id,
    req.validated.body.status
  );
  return sendSuccess(res, 200, 'Task status updated successfully', task);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await taskService.deleteTask(req.validated.params.id);
  return sendSuccess(res, 200, 'Task deleted successfully', task);
});

const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getTaskStats();
  return sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', stats);
});

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
};
