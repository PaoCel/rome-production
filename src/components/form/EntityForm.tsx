import { useState, type FormEvent } from 'react';
import type { EntityDoc, FieldConfig } from '../../types';
import { OWNERS } from '../../data/owners';

// Fields shown right away, matching the mockup's bottom-sheet pattern:
// the title, short-option choices (priority/status/stage…), numbers and
// dates. Everything else — free text, long selects, textarea, checkbox,
// contact — sits under a collapsible "More details" toggle so the sheet
// opens short and never forces the user to scroll past noise.
const CHIP_MAX_OPTIONS = 6;

function isEssential(f: FieldConfig): boolean {
  if (f.essential !== undefined) return f.essential;
  if (f.full) return true;
  if (f.type === 'select' || f.type === 'owner') return true;
  if (f.type === 'number' || f.type === 'date') return true;
  return false;
}

// Generic form rendered from a FieldConfig[] schema.
// The special "contact" field maps to contactId + contactName.
export default function EntityForm({
  fields,
  initial,
  contacts,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  fields: FieldConfig[];
  initial?: EntityDoc | null;
  contacts: EntityDoc[];
  submitLabel: string;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => ({ ...(initial || {}) }));
  const [saving, setSaving] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const set = (name: string, value: any) => setValues((v) => ({ ...v, [name]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  const essential = fields.filter(isEssential);
  const secondary = fields.filter((f) => !isEssential(f));
  // Number fields pair up two-at-a-time (matches the "Stima / Reale" style
  // pairing in the mockup); everything else stacks single-column.
  const numberFields = essential.filter((f) => f.type === 'number');
  const otherEssential = essential.filter((f) => f.type !== 'number');
  const numberPairs: FieldConfig[][] = [];
  for (let i = 0; i < numberFields.length; i += 2) numberPairs.push(numberFields.slice(i, i + 2));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {otherEssential.map((f) => (
        <div key={f.name} className="min-w-0">
          {f.type !== 'checkbox' && <label className="label">{f.label}</label>}
          {renderField(f, values, set, contacts)}
        </div>
      ))}

      {numberPairs.map((pair, i) => (
        <div key={i} className={pair.length === 2 ? 'grid grid-cols-2 gap-3' : ''}>
          {pair.map((f) => (
            <div key={f.name} className="min-w-0">
              <label className="label">{f.label}</label>
              {renderField(f, values, set, contacts)}
            </div>
          ))}
        </div>
      ))}

      {secondary.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className="flex items-center justify-between border-t border-line pt-3 text-sm font-semibold text-muted"
          >
            More details ({secondary.map((f) => f.label).join(', ')})
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className={`shrink-0 transition-transform ${moreOpen ? 'rotate-90' : ''}`}
            >
              <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {moreOpen && (
            <div className="flex flex-col gap-4">
              {secondary.map((f) => (
                <div key={f.name} className="min-w-0">
                  {f.type !== 'checkbox' && <label className="label">{f.label}</label>}
                  {renderField(f, values, set, contacts)}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-end">
        <button type="button" className="btn-secondary w-full sm:w-auto" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

// A row of tappable chips — used for short-option selects (matches the
// mockup's `.choice` pattern) instead of a native dropdown.
function Choices({
  options,
  value,
  onChange,
  allowClear,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  allowClear?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(selected && allowClear ? '' : o)}
            className={`choice ${selected ? 'choice-on' : ''}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function renderField(
  f: FieldConfig,
  values: Record<string, any>,
  set: (name: string, value: any) => void,
  contacts: EntityDoc[],
) {
  switch (f.type) {
    case 'textarea':
      return (
        <textarea
          className="input min-h-[90px] resize-y leading-relaxed"
          value={values[f.name] || ''}
          placeholder={f.placeholder}
          onChange={(e) => set(f.name, e.target.value)}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          className="input min-w-0"
          value={values[f.name] ?? ''}
          onChange={(e) => set(f.name, e.target.value === '' ? 0 : Number(e.target.value))}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          className="input min-w-0"
          value={values[f.name] || ''}
          onChange={(e) => set(f.name, e.target.value)}
        />
      );

    case 'checkbox':
      return (
        <label className="flex cursor-pointer items-center gap-2 pt-1">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-200"
            checked={!!values[f.name]}
            onChange={(e) => set(f.name, e.target.checked)}
          />
          <span className="text-sm text-ink">{f.label}</span>
        </label>
      );

    case 'select':
      if ((f.options?.length ?? 0) <= CHIP_MAX_OPTIONS) {
        return (
          <Choices
            options={f.options || []}
            value={values[f.name] || ''}
            onChange={(v) => set(f.name, v)}
            allowClear
          />
        );
      }
      return (
        <select className="input" value={values[f.name] || ''} onChange={(e) => set(f.name, e.target.value)}>
          <option value="">Select…</option>
          {f.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );

    case 'owner':
      return (
        <Choices
          options={[...OWNERS]}
          value={values[f.name] || ''}
          onChange={(v) => set(f.name, v)}
          allowClear
        />
      );

    case 'contact':
      return (
        <select
          className="input"
          value={values.contactId || ''}
          onChange={(e) => {
            const c = contacts.find((x) => x.id === e.target.value);
            set('contactId', c?.id || '');
            set('contactName', c?.name || '');
          }}
        >
          <option value="">No contact</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      );

    default:
      return (
        <input
          type="text"
          className="input min-w-0"
          value={values[f.name] || ''}
          placeholder={f.placeholder}
          onChange={(e) => set(f.name, e.target.value)}
        />
      );
  }
}
