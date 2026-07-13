import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
import Pill from './ui/Pill';
import Money from './ui/Money';
import CardMenu from './ui/CardMenu';

// Card representing a single entity in a CRUD list.
export default function EntityCard({
  config,
  item,
  onOpen,
  onEdit,
  onDelete,
  readOnly = false,
}: {
  config: EntityConfig;
  item: EntityDoc;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  readOnly?: boolean;
}) {
  const title = item[config.titleField] || 'Untitled';
  const subtitle = (config.subtitleFields || [])
    .map((f) => item[f])
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
    <div className="card group flex flex-col p-3.5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
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

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="text-sm">
          {cost ? (
            <span className="font-medium text-slate-700">
              <Money value={cost} />
            </span>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </div>
        {!readOnly && <CardMenu onEdit={onEdit} onDelete={onDelete} />}
      </div>
    </div>
  );
}
