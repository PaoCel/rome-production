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
      {/* Header */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="break-words text-xl font-semibold text-slate-800">{title}</h3>
          <button className="btn-secondary w-full sm:w-auto sm:shrink-0" onClick={onEdit}>
            Edit
          </button>
        </div>
        {pills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pills.map((p, i) => (
              <Pill key={i} value={p} />
            ))}
          </div>
        )}
      </div>

      {/* Add to budget */}
      {config.budgetSource && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            className="btn-primary w-full sm:w-auto"
            onClick={handleAddToBudget}
            disabled={!isSelected || committing}
            title={isSelected ? '' : 'Mark as Selected first'}
          >
            {committing ? 'Adding…' : 'Add to budget'}
          </button>
          {budgetMsg && <span className="text-sm text-emerald-600">{budgetMsg}</span>}
          {!isSelected && <span className="text-xs text-slate-400">Selected items only</span>}
        </div>
      )}

      {/* Fields */}
      <EntityFields config={config} item={item} />

      {/* Linked options (two-tier requirement → options) */}
      {config.optionConfig && <LinkedOptions config={config} requirement={item} />}

      {/* Media */}
      {config.media && config.relatedType && (
        <MediaGallery relatedType={config.relatedType} relatedId={item.id} />
      )}

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
