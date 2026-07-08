import type { EntityConfig } from '../data/entities';
import type { EntityDoc, FieldConfig } from '../types';
import Money from './ui/Money';
import { formatDate } from '../utils/format';

const MONEY_FIELDS = new Set([
  'costEstimate',
  'actualCost',
  'feeEstimate',
  'actualFee',
  'estimatedCost',
  'amount',
]);
const LINKY = /(link|website)/i;

// Read-only rendering of an entity's fields: a label/value grid plus stacked
// long-text cards. Shared by EntityDetail and OptionDetail.
export default function EntityFields({
  config,
  item,
}: {
  config: EntityConfig;
  item: EntityDoc;
}) {
  const infoFields = config.fields.filter(
    (f) =>
      f.type !== 'textarea' &&
      f.type !== 'checkbox' &&
      !config.pillFields.includes(f.name) &&
      f.name !== config.titleField,
  );
  const textFields = config.fields.filter((f) => f.type === 'textarea');

  return (
    <>
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
    </>
  );
}

export function displayValue(f: FieldConfig, item: EntityDoc): React.ReactNode {
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
