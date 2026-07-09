import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
import { useRelated } from '../hooks/useCollection';
import Pill from './ui/Pill';
import Money from './ui/Money';
import CardMenu from './ui/CardMenu';

// Rich, photo-first card for a single option being evaluated (CRM style).
export default function OptionCard({
  option,
  optionConfig,
  requirementName,
  isSelected,
  committing,
  onOpen,
  onSelect,
  onCommit,
  onEdit,
  onDelete,
}: {
  option: EntityDoc;
  optionConfig: EntityConfig;
  requirementName?: string;
  isSelected: boolean;
  committing: boolean;
  onOpen: () => void;
  onSelect: () => void;
  onCommit: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const media = useRelated('media', optionConfig.relatedType!, option.id);
  // Prefer a photo for the cover; fall back to a video so video-only options
  // still show something at a glance.
  const cover = media.find((m) => m.type === 'image') || media.find((m) => m.type === 'video');
  const shotCount = media.filter((m) => m.type === 'image' || m.type === 'video').length;

  const title = option[optionConfig.titleField] || 'Untitled option';
  const pills = optionConfig.pillFields.map((n) => option[n]).filter(Boolean) as string[];
  const cost = optionConfig.costField ? option[optionConfig.costField] : undefined;

  return (
    <div
      className={`card group flex flex-col overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-card-hover ${
        isSelected ? 'ring-2 ring-brand-400' : ''
      }`}
    >
      {/* Cover */}
      <button onClick={onOpen} className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {cover?.type === 'image' ? (
          <img
            src={cover.downloadUrl}
            alt={title}
            className="h-full w-full object-cover transition group-hover:scale-[1.03]"
          />
        ) : cover?.type === 'video' ? (
          <>
            <video
              src={cover.downloadUrl}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full bg-black object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center text-4xl text-white/90">
              ▶
            </span>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
              <rect x="8" y="10" width="28" height="24" rx="6" fill="currentColor" opacity="0.25" />
              <path d="M15 26l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="18" cy="17" r="2" fill="currentColor" />
            </svg>
          </div>
        )}
        {isSelected && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            ✓ Selected
          </span>
        )}
        {shotCount > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/60 px-2 py-0.5 text-[11px] font-medium text-white">
            {shotCount} media
          </span>
        )}
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3.5">
        <button onClick={onOpen} className="text-left">
          <h3 className="break-words font-semibold text-slate-800 group-hover:text-brand-700">
            {title}
          </h3>
        </button>
        {requirementName && (
          <p className="mt-0.5 truncate text-xs text-slate-400" title={requirementName}>
            for: {requirementName}
          </p>
        )}

        {pills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pills.map((p, i) => (
              <Pill key={i} value={p} />
            ))}
          </div>
        )}

        <div className="mt-2 text-sm">
          {cost ? (
            <span className="font-semibold text-slate-700">
              <Money value={cost} />
            </span>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3">
          <button
            className={
              isSelected
                ? 'btn-primary flex-1 px-2.5 py-1.5 text-xs'
                : 'btn-secondary flex-1 px-2.5 py-1.5 text-xs'
            }
            onClick={onSelect}
          >
            {isSelected ? '✓ Selected' : 'Select'}
          </button>
          {optionConfig.budgetSource && (
            <button
              className="btn-secondary px-2.5 py-1.5 text-xs"
              onClick={onCommit}
              disabled={!isSelected || committing}
              title={isSelected ? '' : 'Select this option first'}
            >
              {committing ? '…' : 'Commit'}
            </button>
          )}
          <CardMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}
