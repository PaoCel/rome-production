import { useState } from 'react';
import type { EntityConfig } from '../data/entities';
import type { EntityDoc, FieldConfig } from '../types';
import Pill from './ui/Pill';
import Money from './ui/Money';
import MediaGallery from './MediaGallery';
import Comments from './Comments';
import RelatedTasks from './RelatedTasks';
import LinkedOptions from './LinkedOptions';
import { addToBudget } from '../services/budget';
import { formatDate } from '../utils/format';

const MONEY_FIELDS = new Set([
  'costEstimate',
  'actualCost',
  'feeEstimate',
  'actualFee',
  'estimatedCost',
]);
const LINKY = /(link|website)/i;

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

  // Fields shown as label/value rows (exclude long text, pills, selected).
  const infoFields = config.fields.filter(
    (f) =>
      f.type !== 'textarea' &&
      f.type !== 'checkbox' &&
      !config.pillFields.includes(f.name) &&
      f.name !== config.titleField,
  );

  const textFields = config.fields.filter((f) => f.type === 'textarea');

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

      {/* Info grid */}
      <div className="card grid grid-cols-1 gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
        {infoFields.map((f) => {
          const val = displayValue(f, item);
          if (val == null) return null;
          return (
            <div key={f.name}>
              <div className="text-xs font-medium text-slate-400">{f.label}</div>
              <div className="break-words text-sm text-slate-700">{val}</div>
            </div>
          );
        })}
      </div>

      {/* Long text */}
      {textFields.some((f) => item[f.name]) && (
        <div className="space-y-3">
          {textFields.map((f) =>
            item[f.name] ? (
              <div key={f.name} className="card p-4">
                <div className="mb-1 text-xs font-medium text-slate-400">{f.label}</div>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                  {item[f.name]}
                </p>
              </div>
            ) : null,
          )}
        </div>
      )}

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

function displayValue(f: FieldConfig, item: EntityDoc): React.ReactNode {
  if (f.type === 'contact') {
    return item.contactName || '—';
  }
  const raw = item[f.name];
  if (raw === undefined || raw === '' || raw === null) return null;

  if (MONEY_FIELDS.has(f.name)) return <Money value={raw} />;
  if (f.type === 'date') return formatDate(raw);

  if (typeof raw === 'string' && (LINKY.test(f.name) || /^https?:\/\//.test(raw))) {
    return (
      <a
        href={raw.startsWith('http') ? raw : `https://${raw}`}
        target="_blank"
        rel="noreferrer"
        className="break-all text-brand-600 hover:underline"
      >
        {raw}
      </a>
    );
  }
  if (f.name === 'email' && typeof raw === 'string') {
    return (
      <a href={`mailto:${raw}`} className="break-all text-brand-600 hover:underline">
        {raw}
      </a>
    );
  }
  return String(raw);
}
