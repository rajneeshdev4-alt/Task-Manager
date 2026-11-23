import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SelectField } from '../../../components/ui/SelectField';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { PRIORITY_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from '../../../utils/labels';
import { useTasks } from '../context/TaskContext';

export function TaskFilters() {
  const { query, updateQuery, resetQuery } = useTasks();
  const [search, setSearch] = useState(query.search);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setSearch(query.search);
  }, [query.search]);

  useEffect(() => {
    if (debouncedSearch !== query.search) {
      updateQuery({ search: debouncedSearch });
    }
  }, [debouncedSearch, query.search, updateQuery]);

  const hasFilters =
    query.search ||
    query.status ||
    query.priority ||
    query.overdue ||
    query.sortBy !== 'createdAt' ||
    query.sortOrder !== 'desc';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="relative block min-w-0 flex-1" htmlFor="search">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Search</span>
          <Search size={16} className="pointer-events-none absolute bottom-3 left-3 text-slate-400" />
          <input
            id="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or description"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/10"
          />
        </label>
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
          <SelectField
            id="status-filter"
            label="Status"
            aria-label="Status"
            value={query.status}
            onChange={(event) => updateQuery({ status: event.target.value })}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="priority-filter"
            label="Priority"
            aria-label="Priority"
            value={query.priority}
            onChange={(event) => updateQuery({ priority: event.target.value })}
          >
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="sort-by"
            label="Sort by"
            aria-label="Sort by"
            value={query.sortBy}
            onChange={(event) => updateQuery({ sortBy: event.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="sort-order"
            label="Order"
            aria-label="Sort order"
            value={query.sortOrder}
            onChange={(event) => updateQuery({ sortOrder: event.target.value })}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </SelectField>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          variant={query.overdue ? 'primary' : 'secondary'}
          size="sm"
          aria-pressed={Boolean(query.overdue)}
          onClick={() => updateQuery({ overdue: query.overdue ? '' : 'true' })}
        >
          Overdue only
        </Button>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={resetQuery}>
            Reset filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
