import { forwardRef } from 'react';

export const SelectField = forwardRef(function SelectField({ id, label, children, ...props }, ref) {
  return (
    <label htmlFor={id} className="block">
      {label ? <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span> : null}
      <select
        id={id}
        ref={ref}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/10"
        {...props}
      >
        {children}
      </select>
    </label>
  );
});
