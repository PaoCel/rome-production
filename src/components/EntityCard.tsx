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
  const phone = typeof item.phone === 'string' ? item.phone : '';
  const email = typeof item.email === 'string' ? item.email : '';

  return (
    <div className="card group flex flex-col p-3.5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <button onClick={onOpen} className="flex-1 text-left">
        <h3 className="break-words pr-2 font-semibold text-ink group-hover:text-brand-700">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 break-words text-sm text-muted">{subtitle}</p>
        )}
        {pills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pills.map((p, i) => (
              <Pill key={i} value={p} />
            ))}
          </div>
        )}
      </button>

      {/* Contact quick actions — call / email. */}
      {(phone || email) && (
        <div className="contact-actions" onClick={(e) => e.stopPropagation()}>
          {phone && (
            <a href={`tel:${phone}`} className="ca" aria-label={`Call ${title}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 6c0 8 6 14 14 14l2-3-4-2-2 2c-3-1-6-4-7-7l2-2-2-4-3 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              Call
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="ca" aria-label={`Email ${title}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              Email
            </a>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <div className="text-sm">
          {cost ? (
            <span className="font-medium text-ink">
              <Money value={cost} />
            </span>
          ) : (
            <span className="text-faint">—</span>
          )}
        </div>
        <CardMenu onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}
