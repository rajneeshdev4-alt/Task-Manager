const mongoose = require('mongoose');
const { PRIORITIES, STATUSES, PRIORITY_ORDER } = require('./task.constants');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title is required'],
      maxlength: [120, 'Title must be 120 characters or fewer'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must be 2000 characters or fewer'],
      default: '',
    },
    priority: {
      type: String,
      enum: {
        values: PRIORITIES,
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
      required: true,
    },
    priorityOrder: {
      type: Number,
      enum: [1, 2, 3],
      default: PRIORITY_ORDER.medium,
      select: false,
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Status must be pending, in_progress, or completed',
      },
      default: 'pending',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

function applyPriorityOrder(doc) {
  if (doc && doc.priority && PRIORITY_ORDER[doc.priority]) {
    doc.priorityOrder = PRIORITY_ORDER[doc.priority];
  }
}

taskSchema.pre('validate', function syncPriorityOrder() {
  applyPriorityOrder(this);
});

taskSchema.pre('findOneAndUpdate', function syncPriorityOrderOnUpdate() {
  const update = this.getUpdate() || {};
  const priority = update.priority ?? update.$set?.priority;
  if (priority && PRIORITY_ORDER[priority]) {
    this.set({ priorityOrder: PRIORITY_ORDER[priority] });
  }
});

taskSchema.index({ status: 1, createdAt: -1 });
taskSchema.index({ priority: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = { Task };
