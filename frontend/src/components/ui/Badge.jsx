import { labelFor, PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../utils/labels';

const statusStyles = {
  pending: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-sky-50 text-sky-800',
  completed: 'bg-emerald-50 text-emerald-800',
};

const priorityStyles = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-50 text-amber-800',
  high: 'bg-rose-50 text-rose-700',
};

export function Badge({ kind, value }) {
  const styles = kind === 'status' ? statusStyles : priorityStyles;
  const options = kind === 'status' ? STATUS_OPTIONS : PRIORITY_OPTIONS;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[value] || statusStyles.pending}`}>
      {labelFor(options, value)}
    </span>
  );
}
