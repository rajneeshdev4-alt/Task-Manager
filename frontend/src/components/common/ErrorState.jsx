import { Button } from '../ui/Button';

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
      <p className="text-sm font-medium text-rose-800">{message}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
