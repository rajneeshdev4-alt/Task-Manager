import { forwardRef } from 'react';

export const TextField = forwardRef(function TextField(
  { id, label, error, multiline = false, ...props },
  ref
) {
  const fieldClass = multiline
    ? 'min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900/10 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4'
    : 'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-slate-900/10 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4';

  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {multiline ? (
        <textarea id={id} ref={ref} className={fieldClass} {...props} />
      ) : (
        <input id={id} ref={ref} className={fieldClass} {...props} />
      )}
      {error ? <span className="mt-1 block text-sm text-rose-600">{error}</span> : null}
    </label>
  );
});
