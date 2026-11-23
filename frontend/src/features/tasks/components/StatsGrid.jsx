import { StatCard } from '../../../components/common/StatCard';

export function StatsGrid({ stats, loading }) {
  const summary = stats?.summary;
  const cards = [
    { label: 'Total tasks', value: summary?.total ?? 0, tone: 'slate', hint: 'All stored tasks' },
    { label: 'Pending', value: summary?.pending ?? 0, tone: 'amber', hint: 'Not started' },
    { label: 'In progress', value: summary?.inProgress ?? 0, tone: 'sky', hint: 'Currently active' },
    { label: 'Completed', value: summary?.completed ?? 0, tone: 'emerald', hint: 'Marked done' },
    { label: 'Overdue', value: summary?.overdue ?? 0, tone: 'rose', hint: 'Past due and open' },
  ];

  if (loading && !summary) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-busy="true">
        {cards.map((card) => (
          <div key={card.label} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
