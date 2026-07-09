import { useState } from 'react';
import type { EntityConfig } from '../data/entities';
import Pill from './ui/Pill';
import MediaGallery from './MediaGallery';
import Comments from './Comments';
import RelatedTasks from './RelatedTasks';
import LinkedOptions from './LinkedOptions';
import EntityFields from './EntityFields';
import { addToBudget } from '../services/budget';
import type { EntityDoc } from '../types';

// Read-only detail view for a CRUD entity, assembled from its config.
export default function EntityDetail({
  config,
  item,
  onEdit,
}: {
  config: EntityConfig;
  item: EntityDoc;
  onEdit: () => void;
}) {
  const [budgetMsg, setBudgetMsg] = useState('');
  const [committing, setCommitting] = useState(false);

  const title = item[config.titleField] || 'Untitled';

  const pills = config.pillFields
    .map((name) => {
      const f = config.fields.find((x) => x.name === name);
      if (f?.type === 'checkbox') return item[name] ? 'Selected' : null;
      return item[name] || null;
    })
    .filter(Boolean) as string[];

  const isSelected = config.selectedField ? !!item[config.selectedField] : false;

  async function handleAddToBudget() {
    if (!config.budgetSource || committing) return;
    setCommitting(true);
    try {
      const res = await addToBudget(config.budgetSource, item);
      setBudgetMsg(res === 'created' ? 'Added to budget ✓' : 'Budget item updated ✓');
    } catch (err) {
      console.error(err);
      setBudgetMsg('Could not add to budget. Try again.');
    } finally {
      setCommitting(false);
      setTimeout(() => setBudgetMsg(''), 2500);
    }
  }

  return (
    <div className="space-y-6">
      <div className="hero">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{config.singular}</p>
            <h3 className="mt-1 break-words font-display text-2xl font-semibold">{title}</h3>
          </div>
          <button
            className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/25"
            onClick={onEdit}
          >
            Edit
          </button>
        </div>
        {pills.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {pills.map((p, i) => (
              <span
                key={i}
                className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add to budget */}
      {config.budgetSource && (
        <div className="card flex flex-col gap-3 border-brand-100 bg-brand-50/60 p-4 dark:border-brand-500/30 dark:bg-brand-500/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-ink">Budget action</div>
            <div className="text-xs text-muted">
              {isSelected ? 'This selected item can be pushed to budget.' : 'Mark as selected before adding it to budget.'}
            </div>
          </div>
          <button
            className="btn-primary w-full sm:w-auto"
            onClick={handleAddToBudget}
            disabled={!isSelected || committing}
            title={isSelected ? '' : 'Mark as Selected first'}
          >
            {committing ? 'Adding…' : 'Add to budget'}
          </button>
          {budgetMsg && <span className="text-sm text-emerald-600">{budgetMsg}</span>}
        </div>
      )}

      {/* Fields */}
      <EntityFields config={config} item={item} />

      {/* Media */}
      {config.media && config.relatedType && (
        <MediaGallery relatedType={config.relatedType} relatedId={item.id} />
      )}

      {/* Linked options (two-tier requirement → options) */}
      {config.optionConfig && <LinkedOptions config={config} requirement={item} />}

      {/* Related tasks */}
      {config.relatedTasks && config.relatedType && (
        <RelatedTasks relatedType={config.relatedType} relatedId={item.id} contextTitle={title} />
      )}

      {/* Comments */}
      {config.comments && config.relatedType && (
        <Comments relatedType={config.relatedType} relatedId={item.id} />
      )}
    </div>
  );
}
