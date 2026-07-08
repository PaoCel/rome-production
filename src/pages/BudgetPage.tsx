import { useMemo, useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { createItem, deleteItem, updateItem } from '../services/firestore';
import {
  BUDGET_CATEGORIES,
  BUDGET_STAGES,
  PAYMENT_STATUSES,
} from '../data/constants';
import type { EntityDoc, FieldConfig } from '../types';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Pill from '../components/ui/Pill';
import Money from '../components/ui/Money';
import EmptyState from '../components/ui/EmptyState';
import SidePanel from '../components/ui/SidePanel';
import EntityForm from '../components/form/EntityForm';

const BUDGET_FIELDS: FieldConfig[] = [
  { name: 'lineItem', label: 'Line item', type: 'text', full: true },
  { name: 'category', label: 'Category', type: 'select', options: BUDGET_CATEGORIES },
  { name: 'estimatedCost', label: 'Estimated cost', type: 'number' },
  { name: 'actualCost', label: 'Actual cost', type: 'number' },
  { name: 'budgetStage', label: 'Budget stage', type: 'select', options: BUDGET_STAGES },
  { name: 'paymentStatus', label: 'Payment status', type: 'select', options: PAYMENT_STATUSES },
  { name: 'supplierContact', label: 'Supplier / contact', type: 'text' },
  { name: 'approvedBy', label: 'Approved by', type: 'text' },
  { name: 'duePaidDate', label: 'Due / paid date', type: 'date' },
  { name: 'committed', label: 'Committed', type: 'checkbox' },
  { name: 'notes', label: 'Notes', type: 'textarea', full: true },
];

const SOURCE_LABEL: Record<string, string> = {
  location: 'From location',
  castingCandidate: 'From casting',
  productionOption: 'From production',
  locationOption: 'From location',
  castingOption: 'From casting',
  crewOption: 'From crew',
  propOption: 'From props',
};

const COMMITTED_STAGES = ['Committed', 'Approved', 'Paid'];
const isCommitted = (it: EntityDoc) =>
  !!it.committed || COMMITTED_STAGES.includes(it.budgetStage);

export default function BudgetPage() {
  const { items, loading } = useCollection('budgetItems');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<EntityDoc | null>(null);
  const [creating, setCreating] = useState(false);

  const totals = useMemo(() => {
    let estimated = 0;
    let committed = 0;
    let actual = 0;
    let paid = 0;
    for (const it of items) {
      const est = Number(it.estimatedCost) || 0;
      const act = Number(it.actualCost) || 0;
      estimated += est;
      actual += act;
      if (isCommitted(it)) committed += est;
      if (it.paymentStatus === 'Paid' || it.budgetStage === 'Paid') paid += act;
    }
    return { estimated, committed, actual, paid };
  }, [items]);

  // Per-category rollup ordered by the master category list.
  const byCategory = useMemo(() => {
    const map = new Map<string, { estimated: number; committed: number; actual: number; count: number }>();
    for (const it of items) {
      const cat = it.category || 'Uncategorised';
      const entry = map.get(cat) || { estimated: 0, committed: 0, actual: 0, count: 0 };
      const est = Number(it.estimatedCost) || 0;
      entry.estimated += est;
      entry.actual += Number(it.actualCost) || 0;
      if (isCommitted(it)) entry.committed += est;
      entry.count += 1;
      map.set(cat, entry);
    }
    const order = (c: string) => {
      const i = BUDGET_CATEGORIES.indexOf(c);
      return i === -1 ? 999 : i;
    };
    return Array.from(map.entries()).sort((a, b) => order(a[0]) - order(b[0]));
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.lineItem, it.category, it.notes, it.supplierContact].some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(q),
      ),
    );
  }, [items, search]);

  async function handleSubmit(values: Record<string, any>) {
    if (editing) await updateItem('budgetItems', editing.id, values);
    else await createItem('budgetItems', values);
    setCreating(false);
    setEditing(null);
  }

  async function handleDelete(it: EntityDoc) {
    if (!confirm(`Delete "${it.lineItem || 'this item'}"?`)) return;
    await deleteItem('budgetItems', it.id);
  }

  return (
    <div>
      <PageHeader
        title="Budget"
        subtitle="Estimates become real spend only once committed or approved."
        action={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + New budget item
          </button>
        }
      />

      {/* Total budget card */}
      <div className="card mb-5 grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
        <Stat label="Estimated total" value={totals.estimated} accent="text-slate-800" />
        <Stat label="Committed / approved" value={totals.committed} accent="text-amber-600" />
        <Stat label="Actual" value={totals.actual} accent="text-indigo-600" />
        <Stat label="Paid" value={totals.paid} accent="text-emerald-600" />
      </div>

      {/* Per-category summary */}
      {byCategory.length > 0 && (
        <div className="card mb-6 overflow-x-auto p-0">
          <table className="w-full min-w-[38rem] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Estimate</th>
                <th className="px-4 py-3 text-right font-medium">Committed</th>
                <th className="px-4 py-3 text-right font-medium">Actual</th>
                <th className="px-4 py-3 text-right font-medium">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byCategory.map(([cat, v]) => (
                <tr key={cat} className="text-slate-700">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{cat}</td>
                  <td className="px-4 py-2.5 text-right"><Money value={v.estimated} /></td>
                  <td className="px-4 py-2.5 text-right text-amber-600"><Money value={v.committed} /></td>
                  <td className="px-4 py-2.5 text-right text-indigo-600"><Money value={v.actual} /></td>
                  <td className="px-4 py-2.5 text-right text-slate-400">{v.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editable list */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Line items</h2>
        <SearchInput value={search} onChange={setSearch} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No budget items" hint="Add one, or commit a selected option from any area." />
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((it) => {
            const diff = (Number(it.actualCost) || 0) - (Number(it.estimatedCost) || 0);
            return (
              <div key={it.id} className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-words font-medium text-slate-800">
                      {it.lineItem || 'Untitled'}
                    </span>
                    {it.category && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        {it.category}
                      </span>
                    )}
                    {it.sourceType && SOURCE_LABEL[it.sourceType] && (
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-600">
                        {SOURCE_LABEL[it.sourceType]}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {it.budgetStage ? (
                      <Pill value={it.budgetStage} />
                    ) : (
                      it.committed && <Pill value="Committed" />
                    )}
                    <Pill value={it.paymentStatus} />
                    {it.supplierContact && (
                      <span className="text-xs text-slate-400">{it.supplierContact}</span>
                    )}
                  </div>
                </div>

                <div className="grid w-full grid-cols-3 gap-x-3 text-left text-sm sm:text-right md:w-auto md:gap-x-5">
                  <div>
                    <div className="text-xs text-slate-400">Est.</div>
                    <Money value={it.estimatedCost} className="font-medium text-slate-700" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Actual</div>
                    <Money value={it.actualCost} className="font-medium text-slate-700" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Diff.</div>
                    <Money
                      value={diff}
                      className={
                        diff > 0 ? 'font-medium text-rose-600' : 'font-medium text-emerald-600'
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 md:flex md:shrink-0 md:items-center">
                  <button className="btn-secondary px-2.5 py-1.5 text-xs" onClick={() => setEditing(it)}>
                    Edit
                  </button>
                  <button className="btn-danger px-2.5 py-1.5 text-xs" onClick={() => handleDelete(it)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SidePanel
        open={creating || !!editing}
        title={editing ? 'Edit budget item' : 'New budget item'}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        <EntityForm
          fields={BUDGET_FIELDS}
          initial={editing}
          contacts={[]}
          submitLabel={editing ? 'Save changes' : 'Create budget item'}
          onSubmit={handleSubmit}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </SidePanel>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent}`}>
        <Money value={value} />
      </div>
    </div>
  );
}
