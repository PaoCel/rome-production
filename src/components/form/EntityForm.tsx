import { useState, type FormEvent } from 'react';
import type { EntityDoc, FieldConfig } from '../../types';
import { OWNERS } from '../../data/owners';

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

  const set = (name: string, value: any) =>
    setValues((v) => ({ ...v, [name]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.full || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            {f.type !== 'checkbox' && <label className="label">{f.label}</label>}
            {renderField(f, values, set, contacts)}
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
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
          className="input"
          value={values[f.name] ?? ''}
          onChange={(e) => set(f.name, e.target.value === '' ? 0 : Number(e.target.value))}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          className="input"
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
      return (
        <select
          className="input"
          value={values[f.name] || ''}
          onChange={(e) => set(f.name, e.target.value)}
        >
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
        <select
          className="input"
          value={values[f.name] || ''}
          onChange={(e) => set(f.name, e.target.value)}
        >
          <option value="">Unassigned</option>
          {OWNERS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
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
          className="input"
          value={values[f.name] || ''}
          placeholder={f.placeholder}
          onChange={(e) => set(f.name, e.target.value)}
        />
      );
  }
}
