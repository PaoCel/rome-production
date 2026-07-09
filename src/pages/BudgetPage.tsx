import { useMemo, useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { createItem, deleteItem, updateItem } from '../services/firestore';
import {
  BUDGET_CATEGORIES,
  BUDGET_STAGES,
  PAYMENT_STATUSES,
  isCommittedItem,
} from '../data/constants';
import type { EntityDoc, FieldConfig } from '../types';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Pill from '../components/ui/Pill';
import Money from '../components/ui/Money';
import EmptyState from '../components/ui/EmptyState';
import BottomSheet from '../components/ui/BottomSheet';
import EntityForm from '../components/form/EntityForm';
import CardMenu from '../components/ui/CardMenu';
import Fab from '../components/ui/Fab';
import { formatMoney } from '../utils/format';

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
      if (isCommittedItem(it)) committed += est;
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
      if (isCommittedItem(it)) entry.committed += est;
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

  async function handleInlineChange(it: EntityDoc, field: 'estimatedCost' | 'actualCost', raw: string) {
    const value = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(value)) return;
    await updateItem('budgetItems', it.id, { [field]: value });
  }

  return (
    <div>
      <Fab onClick={() => setCreating(true)} label="New budget item" />
      <PageHeader
        title="Budget"
        subtitle="Estimates become real spend only once committed or approved."
        action={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + New budget item
          </button>
        }
      />

      {/* Total budget — 4 KPI tiles */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Estimated" value={totals.estimated} tone="kpi-ink" />
        <Stat label="Committed" value={totals.committed} tone="kpi-amber" />
        <Stat label="Actual" value={totals.actual} tone="kpi-good" />
        <Stat label="Paid" value={totals.paid} tone="kpi-brand" />
      </div>

      {/* Explainer */}
      <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-card sm:p-5">
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">💡 Come funziona il budget</h3>
        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-amber-800/90 dark:text-amber-200/90 sm:grid-cols-2">
          <div className="flex gap-1.5">
            <dt className="font-semibold">Stimato:</dt>
            <dd>quanto pensi di spendere</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-semibold">Impegnato:</dt>
            <dd>la stima confermata/approvata</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-semibold">Reale:</dt>
            <dd>quanto hai speso davvero</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-semibold">Pagato:</dt>
            <dd>la parte del reale già saldata</dd>
          </div>
        </dl>
      </div>


      {/* Per-category summary */}
      {byCategory.length > 0 && (
        <div className="mb-6">
          <div className="section-label mb-2">Spend by category</div>
          {/* Desktop: table */}
          <div className="card hidden p-0 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-faint">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Estimate</th>
                  <th className="px-4 py-3 text-right font-medium">Committed</th>
                  <th className="px-4 py-3 text-right font-medium">Actual</th>
                  <th className="px-4 py-3 text-right font-medium">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {byCategory.map(([cat, v]) => (
                  <tr key={cat} className="text-ink">
                    <td className="px-4 py-2.5 font-medium text-ink">{cat}</td>
                    <td className="px-4 py-2.5 text-right"><Money value={v.estimated} /></td>
                    <td className="px-4 py-2.5 text-right text-amber-600"><Money value={v.committed} /></td>
                    <td className="px-4 py-2.5 text-right text-indigo-600"><Money value={v.actual} /></td>
                    <td className="px-4 py-2.5 text-right text-faint">{v.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: one elevated card per category */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {byCategory.map(([cat, v]) => (
              <div key={cat} className="card p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{cat}</span>
                  <span className="rounded-lg bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
                    {v.count} {v.count === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-faint">Estimate</div>
                    <Money value={v.estimated} className="font-bold" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">Committed</div>
                    <Money value={v.committed} className="font-bold text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-good">Actual</div>
                    <Money value={v.actual} className="font-bold text-good" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Line items */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-ink">Line items</h2>
        <SearchInput value={search} onChange={setSearch} />
      </div>

      {loading ? (
        <p className="text-sm text-faint">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No budget items" hint="Add one, or commit a selected option from any area." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((it) => {
            const estimated = Number(it.estimatedCost) || 0;
            const actual = Number(it.actualCost) || 0;
            const diff = actual - estimated;
            return (
              <div key={it.id} className="card flex flex-col gap-3 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 flex-1 break-words font-semibold text-ink">
                    {it.lineItem || 'Untitled'}
                  </span>
                  <CardMenu onEdit={() => setEditing(it)} onDelete={() => handleDelete(it)} />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {it.category && (
                    <span className="rounded-lg bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
                      {it.category}
                    </span>
                  )}
                  {it.sourceType && SOURCE_LABEL[it.sourceType] && (
                    <span className="rounded-lg bg-brand-50 dark:bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-600">
                      {SOURCE_LABEL[it.sourceType]}
                    </span>
                  )}
                  {it.budgetStage ? (
                    <Pill value={it.budgetStage} />
                  ) : (
                    it.committed && <Pill value="Committed" />
                  )}
                  <Pill value={it.paymentStatus} />
                  {it.supplierContact && (
                    <span className="text-xs text-faint">{it.supplierContact}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="min-w-0 rounded-xl bg-surface-2 p-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-faint">Stima</div>
                    <input
                      key={`est-${it.id}`}
                      type="number"
                      className="mt-0.5 w-full min-w-0 bg-transparent text-base font-bold text-ink outline-none"
                      defaultValue={it.estimatedCost ?? ''}
                      onBlur={(e) => handleInlineChange(it, 'estimatedCost', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                    />
                  </div>
                  <div className="min-w-0 rounded-xl bg-surface-2 p-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-faint">Reale</div>
                    <input
                      key={`actual-${it.id}`}
                      type="number"
                      className="mt-0.5 w-full min-w-0 bg-transparent text-base font-bold text-ink outline-none"
                      defaultValue={it.actualCost ?? ''}
                      onBlur={(e) => handleInlineChange(it, 'actualCost', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                    />
                  </div>
                </div>

                {!(Number(it.actualCost) || 0) && (Number(it.estimatedCost) || 0) > 0 ? (
                  <span className="variance variance-wait">In attesa del costo reale</span>
                ) : diff > 0 ? (
                  <span className="variance variance-over">↑ +{formatMoney(diff)} sopra la stima</span>
                ) : diff < 0 ? (
                  <span className="variance variance-under">↓ -{formatMoney(Math.abs(diff))} sotto la stima</span>
                ) : (
                  <span className="variance variance-flat">In linea con la stima</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BottomSheet
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
      </BottomSheet>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-val ${tone}`}>
        <Money value={value} />
      </div>
    </div>
  );
}
