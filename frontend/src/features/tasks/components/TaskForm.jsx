import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { SelectField } from '../../../components/ui/SelectField';
import { TextField } from '../../../components/ui/TextField';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../../utils/labels';
import { taskFormSchema, zodFormResolver } from '../validation/taskSchema';

const emptyValues = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  dueDate: '',
};

export function TaskForm({ initialValues, submitLabel, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodFormResolver(taskFormSchema),
    defaultValues: { ...emptyValues, ...initialValues },
  });

  const initialKey = JSON.stringify(initialValues ?? emptyValues);

  useEffect(() => {
    reset({ ...emptyValues, ...JSON.parse(initialKey) });
  }, [initialKey, reset]);

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          dueDate: values.dueDate || null,
        });
      })}
    >
      <TextField
        id="title"
        label="Title"
        placeholder="What needs to be done?"
        error={errors.title?.message}
        {...register('title')}
      />
      <TextField
        id="description"
        label="Description"
        placeholder="Add context, notes, or acceptance criteria"
        multiline
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField id="priority" label="Priority" {...register('priority')}>
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <SelectField id="status" label="Status" {...register('status')}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>
      <TextField id="dueDate" label="Due date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
