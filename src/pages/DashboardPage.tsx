import { Link } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import { useAuth } from '../contexts/AuthContext';
import { NAV_ITEMS } from '../layouts/navItems';
import PageHeader from '../components/PageHeader';
import Money from '../components/ui/Money';

export default function DashboardPage() {
  const { displayName } = useAuth();
  const tasks = useCollection('tasks').items;
  const budget = useCollection('budgetItems').items;
  const locations = useCollection('locations').items;
  const casting = useCollection('castingCandidates').items;
  const production = useCollection('productionOptions').items;
  const risks = useCollection('risks').items;
  const decisions = useCollection('decisions').items;

  const openTasks = tasks.filter((t) => t.status && t.status !== 'Done').length;
  const highTasks = tasks.filter((t) => t.priority === 'High' && t.status !== 'Done').length;
  const blockedTasks = tasks.filter((t) => t.status === 'Blocked').length;

  const estimated = sum(budget, 'estimatedCost');
  const committed = budget.filter((b) => b.committed).reduce((s, b) => s + num(b.estimatedCost), 0);
  const actual = sum(budget, 'actualCost');
  const paid = budget
    .filter((b) => b.paymentStatus === 'Paid')
    .reduce((s, b) => s + num(b.actualCost), 0);

  const selectedLoc = locations.filter((l) => l.selected).length;
  const selectedCast = casting.filter((c) => c.selected).length;
  const selectedProd = production.filter((p) => p.selected).length;

  const openRisks = risks.filter((r) => r.status === 'Open').length;
  const pendingDecisions = decisions.filter(
    (d) => d.status === 'Needed' || d.status === 'Pending',
  ).length;

  return (
    <div>
      <PageHeader title={`Welcome, ${displayName}`} subtitle="Production overview at a glance" />

      {/* Tasks */}
      <Section title="Tasks">
        <StatCard label="Open tasks" value={openTasks} to="/tasks" tone="indigo" />
        <StatCard label="High priority" value={highTasks} to="/tasks" tone="red" />
        <StatCard label="Blocked" value={blockedTasks} to="/tasks" tone="amber" />
      </Section>

      {/* Budget */}
      <Section title="Budget">
        <MoneyCard label="Estimated" value={estimated} to="/budget" tone="slate" />
        <MoneyCard label="Committed" value={committed} to="/budget" tone="amber" />
        <MoneyCard label="Actual" value={actual} to="/budget" tone="indigo" />
        <MoneyCard label="Paid" value={paid} to="/budget" tone="emerald" />
      </Section>

      {/* Selections */}
      <Section title="Selections">
        <StatCard label="Selected locations" value={selectedLoc} to="/locations" tone="emerald" />
        <StatCard label="Selected casting" value={selectedCast} to="/casting" tone="emerald" />
        <StatCard label="Selected production" value={selectedProd} to="/production" tone="emerald" />
      </Section>

      {/* Risks & decisions */}
      <Section title="Risks & Decisions">
        <StatCard label="Open risks" value={openRisks} to="/risks" tone="red" />
        <StatCard label="Pending decisions" value={pendingDecisions} to="/risks" tone="amber" />
      </Section>

      {/* Quick links */}
      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-500">Quick links</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {NAV_ITEMS.filter((n) => n.to !== '/').map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="card flex items-center gap-3 p-4 transition hover:shadow-md"
            >
              <span className="text-xl">{n.icon}</span>
              <span className="text-sm font-medium text-slate-700">{n.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  indigo: 'text-indigo-600',
  red: 'text-red-600',
  amber: 'text-amber-600',
  emerald: 'text-emerald-600',
  slate: 'text-slate-800',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="mb-2 text-sm font-semibold text-slate-500">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  to,
  tone,
}: {
  label: string;
  value: number;
  to: string;
  tone: string;
}) {
  return (
    <Link to={to} className="card p-4 transition hover:shadow-md">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${TONES[tone]}`}>{value}</div>
    </Link>
  );
}

function MoneyCard({
  label,
  value,
  to,
  tone,
}: {
  label: string;
  value: number;
  to: string;
  tone: string;
}) {
  return (
    <Link to={to} className="card p-4 transition hover:shadow-md">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${TONES[tone]}`}>
        <Money value={value} />
      </div>
    </Link>
  );
}

function num(v: any): number {
  return Number(v) || 0;
}
function sum(items: any[], field: string): number {
  return items.reduce((s, it) => s + num(it[field]), 0);
}
