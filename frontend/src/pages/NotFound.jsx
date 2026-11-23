import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';

export function NotFound() {
  return (
    <AppShell>
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">That route is not part of the task manager.</p>
        <Link to="/" className="mt-5 inline-flex text-sm font-medium text-slate-900 underline">
          Back to dashboard
        </Link>
      </div>
    </AppShell>
  );
}
