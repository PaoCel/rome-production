import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
import Pill from './ui/Pill';
import MediaGallery from './MediaGallery';
import Comments from './Comments';
import EntityFields from './EntityFields';
import AppIcon from './icons/AppIcon';

// Full "scheda" for an option, shown inside a side panel. Presentational —
// the parent OptionsGallery owns select/commit state and passes handlers in.
export default function OptionDetail({
  option,
  optionConfig,
  requirementName,
  isSelected,
  committing,
  budgetMsg,
  onSelect,
  onCommit,
  onEdit,
  readOnly = false,
}: {
  option: EntityDoc;
  optionConfig: EntityConfig;
  requirementName?: string;
  isSelected: boolean;
  committing: boolean;
  budgetMsg: string;
  onSelect: () => void;
  onCommit: () => void;
  onEdit: () => void;
  readOnly?: boolean;
}) {
  const title = option[optionConfig.titleField] || 'Untitled option';
  const pills = optionConfig.pillFields.map((n) => option[n]).filter(Boolean) as string[];
  const useLocationGrid = optionConfig.relatedType === 'locationOption';

  return (
    <div className="space-y-6">
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="section-label">{optionConfig.singular}</p>
            <h3 className="mt-1 break-words font-display text-2xl font-semibold text-slate-900">{title}</h3>
            {requirementName && (
              <p className="mt-0.5 text-sm text-slate-400">for: {requirementName}</p>
            )}
          </div>
          {!readOnly && (
            <button className="btn-secondary w-full sm:w-auto sm:shrink-0" onClick={onEdit}>
              Edit
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {isSelected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
              <AppIcon name="check" className="h-3 w-3" />
              Selected
            </span>
          )}
          {pills.map((p, i) => (
            <Pill key={i} value={p} />
          ))}
        </div>
      </div>

      {/* Actions */}
      {!readOnly && <div className="card flex flex-col gap-3 border-brand-100 bg-brand-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-800">Selection & budget</div>
          <div className="text-xs text-slate-500">
            {isSelected ? 'Selected for this requirement.' : 'Select this option before committing budget.'}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          className={isSelected ? 'btn-secondary w-full sm:w-auto' : 'btn-primary w-full sm:w-auto'}
          onClick={onSelect}
        >
          {isSelected ? 'Deselect' : 'Select this option'}
        </button>
        {optionConfig.budgetSource && (
          <button
            className="btn-secondary w-full sm:w-auto"
            onClick={onCommit}
            disabled={!isSelected || committing}
            title={isSelected ? '' : 'Select this option first'}
          >
            {committing ? 'Committing…' : 'Commit to budget'}
          </button>
        )}
        {budgetMsg && <span className="text-sm text-emerald-600">{budgetMsg}</span>}
        </div>
      </div>}

      {/* Location options use the same social-style media grid as casting profiles. */}
      {optionConfig.relatedType && (
        <MediaGallery
          relatedType={optionConfig.relatedType}
          relatedId={option.id}
          hero={!useLocationGrid}
          profileGrid={useLocationGrid}
          readOnly={readOnly}
        />
      )}

      {/* Fields */}
      <EntityFields config={optionConfig} item={option} />

      {/* Comments */}
      {optionConfig.relatedType && (
        <Comments relatedType={optionConfig.relatedType} relatedId={option.id} readOnly={readOnly} />
      )}
    </div>
  );
}
