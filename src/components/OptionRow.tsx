import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
import { useRelated } from '../hooks/useCollection';
import { firstUploadedPhoto } from '../utils/media';
import CardMenu from './ui/CardMenu';
import Pill from './ui/Pill';
import Money from './ui/Money';

// Compact list row for an option — an alternative to the photo-first OptionCard
// grid, for categories (like Crew) that get long and are easier to scan as a list.
export default function OptionRow({
  option,
  optionConfig,
  requirementName,
  isSelected,
  onOpen,
  onEdit,
  onDelete,
  readOnly = false,
}: {
  option: EntityDoc;
  optionConfig: EntityConfig;
  requirementName?: string;
  isSelected: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  readOnly?: boolean;
}) {
  const media = useRelated('media', optionConfig.relatedType!, option.id);
  const avatar = firstUploadedPhoto(media);
  const name = option[optionConfig.titleField] || 'Untitled option';
  const pills = optionConfig.pillFields.map((n) => option[n]).filter(Boolean) as string[];
  const cost = optionConfig.costField ? option[optionConfig.costField] : undefined;

  return (
    <article className="card group flex items-center gap-3 p-2.5 transition hover:border-brand-200 hover:shadow-card-hover sm:gap-4 sm:p-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
        aria-label={`Open ${name}`}
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
            {requirementName || optionConfig.singular}
          </span>
          {pills.length > 0 && (
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              {pills.map((p, i) => (
                <Pill key={i} value={p} />
              ))}
            </span>
          )}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2.5">
        {cost ? (
          <span className="text-sm font-medium text-slate-700">
            <Money value={cost} />
          </span>
        ) : null}
        {!readOnly && <CardMenu onEdit={onEdit} onDelete={onDelete} />}
      </div>
    </article>
  );
}
