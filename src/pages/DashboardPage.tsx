import { Link } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { BUDGET_CATEGORIES, isCommittedItem } from '../data/constants';
import { formatMoney } from '../utils/format';
import Money from '../components/ui/Money';

export default function DashboardPage() {
  const { displayName } = useAuth();
  const { settings } = useSettings();
  const tasks = useCollection('tasks').items;
  const budget = useCollection('budgetItems').items;
  const risks = useCollection('risks').items;
  const decisions = useCollection('decisions').items;

  // Two-tier requirement collections (for selection progress).
  const locationReqs = useCollection('locationRequirements').items;
  const castRoles = useCollection('castRoles').items;
  const crewReqs = useCollection('crewRequirements').items;
  const propItems = useCollection('propItems').items;

  const openTasks = tasks.filter((t) => t.status && t.status !== 'Done').length;
  const highTasks = tasks.filter((t) => t.priority === 'High' && t.status !== 'Done').length;
  const blockedTasks = tasks.filter((t) => t.status === 'Blocked').length;

  const estimated = sum(budget, 'estimatedCost');
  const committed = budget
    .filter(isCommittedItem)
    .reduce((s, b) => s + num(b.estimatedCost), 0);
  const actual = sum(budget, 'actualCost');

  const openRisks = risks.filter((r) => r.status === 'Open').length;
  const pendingDecisions = decisions.filter(
    (d) => d.status === 'Needed' || d.status === 'Pending' || d.status === 'Open',
  ).length;

  const selections = [
    { label: 'Locations', to: '/locations', items: locationReqs },
    { label: 'Cast', to: '/casting', items: castRoles },
    { label: 'Crew', to: '/crew', items: crewReqs },
    { label: 'Props', to: '/props', items: propItems },
  ].map((s) => ({
    ...s,
    total: s.items.length,
    chosen: s.items.filter((i) => i.selectedOptionId).length,
  }));

  // Budget by category (estimate vs committed), master-list order.
  const categoryRollup = BUDGET_CATEGORIES.map((cat) => {
    const rows = budget.filter((b) => b.category === cat);
    return {
      cat,
      estimated: rows.reduce((s, b) => s + num(b.estimatedCost), 0),
      committed: rows.filter(isCommittedItem).reduce((s, b) => s + num(b.estimatedCost), 0),
    };
  }).filter((c) => c.estimated > 0);
  const maxCat = Math.max(1, ...categoryRollup.map((c) => c.estimated));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <p className="section-label">Production overview</p>
        <h1 className="mt-1 break-words font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
          Ciao, {displayName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {settings.productionSubtitle} — everything you're tracking, at a glance.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi to="/tasks" icon="✅" label="Open tasks" value={openTasks} sub={`${highTasks} high priority`} tone="indigo" />
        <Kpi to="/budget" icon="💶" label="Committed budget" money={committed} sub={`of ${formatMoney(estimated)} estimated`} tone="amber" />
        <Kpi to="/budget" icon="🧾" label="Actual spend" money={actual} sub="paid & incurred" tone="emerald" />
        <Kpi to="/risks" icon="⚠️" label="Open risks" value={openRisks} sub={`${pendingDecisions} decisions pending`} tone="rose" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Budget by category */}
        <section className="card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-slate-800">Budget by category</h2>
            <Link to="/budget" className="text-xs font-medium text-brand-600 hover:underline">
              View budget →
            </Link>
          </div>
          {categoryRollup.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No budget yet. Commit a selected option to start tracking spend.
            </p>
          ) : (
            <div className="space-y-3">
              {categoryRollup.map((c) => (
                <div key={c.cat}>
                  <div className="mb-1 flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-slate-700">{c.cat}</span>
                    <span className="tabular-nums text-slate-500">
                      <span className="text-amber-600">{formatMoney(c.committed)}</span>
                      <span className="text-slate-300"> / </span>
                      {formatMoney(c.estimated)}
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                    {/* estimate track */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-brand-200"
                      style={{ width: `${(c.estimated / maxCat) * 100}%` }}
                    />
                    {/* committed fill */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-amber-500"
                      style={{ width: `${(c.committed / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-500" /> Committed</span>
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brand-200" /> Estimated</span>
              </div>
            </div>
          )}
        </section>

        {/* Needs attention */}
        <section className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Needs attention</h2>
          <div className="space-y-2.5">
            <Attn to="/tasks" label="Blocked tasks" value={blockedTasks} tone="rose" />
            <Attn to="/tasks" label="High-priority open" value={highTasks} tone="amber" />
            <Attn to="/risks" label="Open risks" value={openRisks} tone="rose" />
            <Attn to="/risks" label="Pending decisions" value={pendingDecisions} tone="amber" />
          </div>
        </section>
      </div>

      {/* Selection progress */}
      <section>
        <h2 className="mb-3 font-semibold text-slate-800">Selection progress</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {selections.map((s) => {
            const pct = s.total ? Math.round((s.chosen / s.total) * 100) : 0;
            return (
              <Link key={s.label} to={s.to} className="card p-4 transition hover:shadow-card-hover">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-700">{s.label}</span>
                  <span className="text-xs text-slate-400">{s.chosen}/{s.total}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 text-xs text-slate-400">
                  {s.total === 0 ? 'No requirements yet' : `${pct}% selected`}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const KPI_TONES: Record<string, string> = {
  indigo: 'text-brand-600',
  amber: 'text-amber-600',
  emerald: 'text-emerald-600',
  rose: 'text-rose-600',
};

function Kpi({
  to,
  icon,
  label,
  value,
  money,
  sub,
  tone,
}: {
  to: string;
  icon: string;
  label: string;
  value?: number;
  money?: number;
  sub: string;
  tone: string;
}) {
  return (
    <Link to={to} className="card p-4 transition hover:shadow-card-hover">
      <div className="flex items-center justify-between gap-2">
        <span className="section-label">{label}</span>
        <span className="text-base">{icon}</span>
      </div>
      <div className={`mt-2 break-words text-2xl font-semibold ${KPI_TONES[tone]}`}>
        {money !== undefined ? <Money value={money} /> : value}
      </div>
      <div className="mt-0.5 text-xs text-slate-400">{sub}</div>
    </Link>
  );
}

const ATTN_TONES: Record<string, string> = {
  rose: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-700',
};

function Attn({ to, label, value, tone }: { to: string; label: string; value: number; tone: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50"
    >
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={`min-w-[1.75rem] rounded-full px-2 py-0.5 text-center text-xs font-semibold ${
          value > 0 ? ATTN_TONES[tone] : 'bg-slate-100 text-slate-400'
        }`}
      >
        {value}
      </span>
    </Link>
  );
}

function num(v: any): number {
  return Number(v) || 0;
}
function sum(items: any[], field: string): number {
  return items.reduce((s, it) => s + num(it[field]), 0);
}
