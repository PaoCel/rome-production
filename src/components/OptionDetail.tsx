import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
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
    <div className="space-y-5">
      <div className="hero">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
              {optionConfig.singular}
              {requirementName ? ` · for ${requirementName}` : ''}
            </p>
            <h3 className="mt-1 break-words font-display text-2xl font-semibold">{title}</h3>
          </div>
          <button
            className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/25"
            onClick={onEdit}
          >
            Edit
          </button>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {isSelected && (
            <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold text-white">
              ✓ Selected
            </span>
          )}
          {pills.map((p, i) => (
            <span key={i} className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={isSelected ? 'btn-secondary px-3 py-1.5 text-sm' : 'btn-primary px-3 py-1.5 text-sm'}
          onClick={onSelect}
        >
          {isSelected ? '✓ Selected' : 'Select this option'}
        </button>
        {optionConfig.budgetSource && (
          <button
            className="btn-secondary px-3 py-1.5 text-sm"
            onClick={onCommit}
            disabled={!isSelected || committing}
            title={isSelected ? '' : 'Select this option first'}
          >
            {committing ? 'Committing…' : 'Commit to budget'}
          </button>
        )}
        {budgetMsg && <span className="text-sm text-good">{budgetMsg}</span>}
      </div>

      {/* Photos + files */}
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
