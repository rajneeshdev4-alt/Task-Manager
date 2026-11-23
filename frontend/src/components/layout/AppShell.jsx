import { CheckSquare } from 'lucide-react';
import { todayLabel } from '../../utils/dates';

export function AppShell({ children }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <CheckSquare size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none text-slate-900">Taskflow</p>
              <p className="mt-1 text-xs text-slate-500">Task manager</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-slate-500 sm:block">{todayLabel()}</p>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                WS
              </span>
              <span className="pr-1 text-sm font-medium text-slate-700">Shared workspace</span>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
