import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
import Pill from './ui/Pill';
import MediaGallery from './MediaGallery';
import Comments from './Comments';
import EntityFields from './EntityFields';

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
}) {
  const title = option[optionConfig.titleField] || 'Untitled option';
  const pills = optionConfig.pillFields.map((n) => option[n]).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="break-words text-xl font-semibold text-slate-800">{title}</h3>
            {requirementName && (
              <p className="mt-0.5 text-sm text-slate-400">for: {requirementName}</p>
            )}
          </div>
          <button className="btn-secondary w-full sm:w-auto sm:shrink-0" onClick={onEdit}>
            Edit
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {isSelected && (
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
              ✓ Selected
            </span>
          )}
          {pills.map((p, i) => (
            <Pill key={i} value={p} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
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

      {/* Photos + files (large cover) */}
      {optionConfig.relatedType && (
        <MediaGallery relatedType={optionConfig.relatedType} relatedId={option.id} hero />
      )}

      {/* Fields */}
      <EntityFields config={optionConfig} item={option} />

      {/* Comments */}
      {optionConfig.relatedType && (
        <Comments relatedType={optionConfig.relatedType} relatedId={option.id} />
      )}
    </div>
  );
}
