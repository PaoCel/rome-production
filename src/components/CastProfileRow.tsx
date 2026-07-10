import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
import { useRelated } from '../hooks/useCollection';
import { firstUploadedPhoto } from '../utils/media';
import CardMenu from './ui/CardMenu';
import { CastingVoteSummary, type CastingVoteCounts } from './CastingVoteControls';

export default function CastProfileRow({
  option,
  optionConfig,
  roleName,
  counts,
  isSelected,
  onOpen,
  onEdit,
  onDelete,
  readOnly,
}: {
  option: EntityDoc;
  optionConfig: EntityConfig;
  roleName?: string;
  counts: CastingVoteCounts;
  isSelected: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  readOnly: boolean;
}) {
  const media = useRelated('media', optionConfig.relatedType!, option.id);
  const avatar = firstUploadedPhoto(media);
  const name = option[optionConfig.titleField] || 'Untitled candidate';
  const summary = option.description || option.notes;

  return (
    <article
      className={`card group flex items-center gap-3 p-2.5 transition hover:border-brand-200 hover:shadow-card-hover sm:gap-4 sm:p-3 ${
        isSelected ? 'ring-2 ring-brand-300' : ''
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
        aria-label={`Open ${name} profile`}
      >
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-brand-100 to-slate-100 ring-2 ring-white shadow-sm sm:h-16 sm:w-16">
          {avatar ? (
            <img src={avatar.downloadUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-brand-500">
              {String(name).charAt(0).toUpperCase()}
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-slate-900 transition group-hover:text-brand-700">
              {name}
            </span>
            {isSelected && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                Selected
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-sm text-slate-500">
            {[roleName, option.age && `${option.age} yrs`].filter(Boolean).join(' · ') || 'Casting profile'}
          </span>
          {summary && (
            <span className="mt-1 hidden truncate text-xs text-slate-400 sm:block">{summary}</span>
          )}
        </span>
      </button>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        <CastingVoteSummary counts={counts} />
        {!readOnly && <CardMenu onEdit={onEdit} onDelete={onDelete} />}
      </div>
    </article>
  );
}
