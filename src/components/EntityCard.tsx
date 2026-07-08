import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
import Pill from './ui/Pill';
import Money from './ui/Money';

// Card representing a single entity in a CRUD list.
export default function EntityCard({
  config,
  item,
  onOpen,
  onEdit,
  onDelete,
}: {
  config: EntityConfig;
  item: EntityDoc;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const title = item[config.titleField] || 'Untitled';
  const subtitle = (config.subtitleFields || [])
    .map((f) => (f === 'contactName' ? item.contactName : item[f]))
    .filter(Boolean)
    .join(' · ');

  const pills = config.pillFields
    .map((name) => {
      const f = config.fields.find((x) => x.name === name);
      if (f?.type === 'checkbox') return item[name] ? 'Selected' : null;
      return item[name] || null;
    })
    .filter(Boolean) as string[];

  const cost = config.costField ? item[config.costField] : undefined;

  return (
    <div className="card group flex flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <button onClick={onOpen} className="flex-1 text-left">
        <h3 className="break-words pr-2 font-semibold text-slate-800 group-hover:text-brand-700">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 break-words text-sm text-slate-500">{subtitle}</p>
        )}
        {pills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pills.map((p, i) => (
              <Pill key={i} value={p} />
            ))}
          </div>
        )}
      </button>

      <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          {cost ? (
            <span className="font-medium text-slate-700">
              <Money value={cost} />
            </span>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1 sm:flex sm:shrink-0 sm:items-center">
          <button className="btn-secondary px-2.5 py-1.5 text-xs" onClick={onEdit}>
            Edit
          </button>
          <button className="btn-danger px-2.5 py-1.5 text-xs" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
