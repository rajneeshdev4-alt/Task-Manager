import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#64748b',
  in_progress: '#0284c7',
  completed: '#059669',
};

const PRIORITY_COLORS = {
  low: '#94a3b8',
  medium: '#d97706',
  high: '#e11d48',
};

function ChartCard({ title, children, empty }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 h-56">
        {empty ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No data yet</div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export function DashboardCharts({ stats }) {
  const statusData = stats?.statusDistribution || [];
  const priorityData = stats?.priorityDistribution || [];
  const monthly = stats?.monthly || [];
  const hasStatus = statusData.some((item) => item.count > 0);
  const hasPriority = priorityData.some((item) => item.count > 0);

  return (
    <div className="grid gap-3 xl:grid-cols-3">
      <ChartCard title="Status distribution" empty={!hasStatus}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={statusData} dataKey="count" nameKey="label" innerRadius={48} outerRadius={78} paddingAngle={3}>
              {statusData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Priority distribution" empty={!hasPriority}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={priorityData}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {priorityData.map((entry) => (
                <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Tasks created by month" empty={monthly.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthly}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
