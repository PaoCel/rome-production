import { useMemo, useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { createItem, deleteItem, updateItem } from '../services/firestore';
import { PAYMENT_STATUSES } from '../data/constants';
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
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'estimatedCost', label: 'Estimated cost', type: 'number' },
  { name: 'actualCost', label: 'Actual cost', type: 'number' },
  { name: 'paymentStatus', label: 'Payment status', type: 'select', options: PAYMENT_STATUSES },
  { name: 'committed', label: 'Committed', type: 'checkbox' },
  { name: 'notes', label: 'Notes', type: 'textarea', full: true },
];

const SOURCE_LABEL: Record<string, string> = {
  location: 'From location',
  castingCandidate: 'From casting',
  productionOption: 'From production',
};

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
      if (it.committed) committed += est;
      if (it.paymentStatus === 'Paid') paid += act;
    }
    return { estimated, committed, actual, paid };
  }, [items]);

  const byCategory = useMemo(() => {
    const map = new Map<string, { estimated: number; actual: number; count: number }>();
    for (const it of items) {
      const cat = it.category || 'Uncategorised';
      const entry = map.get(cat) || { estimated: 0, actual: 0, count: 0 };
      entry.estimated += Number(it.estimatedCost) || 0;
      entry.actual += Number(it.actualCost) || 0;
      entry.count += 1;
      map.set(cat, entry);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].estimated - a[1].estimated);
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.lineItem, it.category, it.notes].some(
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
        action={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + New budget item
          </button>
        }
      />

      {/* Total budget card */}
      <div className="card mb-5 grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
        <Stat label="Estimated total" value={totals.estimated} accent="text-slate-800" />
        <Stat label="Committed" value={totals.committed} accent="text-amber-600" />
        <Stat label="Actual" value={totals.actual} accent="text-indigo-600" />
        <Stat label="Paid" value={totals.paid} accent="text-emerald-600" />
      </div>

      {/* Category cards */}
      {byCategory.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {byCategory.map(([cat, v]) => (
            <div key={cat} className="card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">{cat}</h3>
                <span className="text-xs text-slate-400">{v.count} items</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Estimated</span>
                <Money value={v.estimated} className="font-medium text-slate-700" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Actual</span>
                <Money value={v.actual} className="font-medium text-slate-700" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editable list */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Line items</h2>
        <SearchInput value={search} onChange={setSearch} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No budget items" hint="Add one, or use “Add to budget” from a selected item." />
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((it) => (
            <div key={it.id} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
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
                  {it.committed && <Pill value="Committed" />}
                  <Pill value={it.paymentStatus} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 text-right text-sm">
                <div>
                  <div className="text-xs text-slate-400">Est.</div>
                  <Money value={it.estimatedCost} className="font-medium text-slate-700" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Actual</div>
                  <Money value={it.actualCost} className="font-medium text-slate-700" />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button className="btn-secondary px-2.5 py-1.5 text-xs" onClick={() => setEditing(it)}>
                  Edit
                </button>
                <button className="btn-danger px-2.5 py-1.5 text-xs" onClick={() => handleDelete(it)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
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
