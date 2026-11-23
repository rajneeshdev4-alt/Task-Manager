const { Router } = require('express');
const taskController = require('./task.controller');
const { validate } = require('../../middleware/validate.middleware');
const {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  taskIdSchema,
  listTasksSchema,
} = require('./task.validation');

const router = Router();

router.get('/stats', taskController.getTaskStats);
router.get('/', validate(listTasksSchema, 'query'), taskController.listTasks);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/:id', validate(taskIdSchema, 'params'), taskController.getTask);
router.put('/:id', validate(taskIdSchema, 'params'), validate(updateTaskSchema), taskController.updateTask);
router.patch(
  '/:id/status',
  validate(taskIdSchema, 'params'),
  validate(updateStatusSchema),
  taskController.updateTaskStatus
);
router.delete('/:id', validate(taskIdSchema, 'params'), taskController.deleteTask);

module.exports = router;
