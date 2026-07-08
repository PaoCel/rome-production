import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { CURRENCIES, useSettings } from '../contexts/SettingsContext';
import { OWNERS } from '../data/owners';
import { PROJECT_ID } from '../config/firebase';
import {
  REJOICE_DOC_COUNT,
  importRejoiceData,
  clearRejoiceData,
} from '../services/seed';

export default function SettingsPage() {
  const { settings, update, reset } = useSettings();
  const [busy, setBusy] = useState<'' | 'import' | 'clear'>('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function doImport() {
    if (
      !confirm(
        `Import the ${REJOICE_DOC_COUNT} Rejoice items from the Excel tracker?\n\n` +
          `Existing items with the same ID will be overwritten.`,
      )
    )
      return;
    setBusy('import');
    setMsg(null);
    try {
      const n = await importRejoiceData();
      setMsg({ text: `Imported ${n} items from the Excel tracker.`, ok: true });
    } catch (e: any) {
      setMsg({ text: `Import failed: ${e?.message || e}`, ok: false });
    } finally {
      setBusy('');
    }
  }

  async function doClear() {
    if (
      !confirm(
        `Remove the ${REJOICE_DOC_COUNT} items that came from the Excel import?\n\n` +
          `Items you added manually are kept. This cannot be undone.`,
      )
    )
      return;
    setBusy('clear');
    setMsg(null);
    try {
      const n = await clearRejoiceData();
      setMsg({ text: `Removed ${n} imported items. You can now build the data manually.`, ok: true });
    } catch (e: any) {
      setMsg({ text: `Remove failed: ${e?.message || e}`, ok: false });
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle="Preferences and data management for this production." />

      {/* General */}
      <Section title="General" desc="Names shown across the app.">
        <Field label="Production name">
          <input
            className="input"
            value={settings.productionName}
            onChange={(e) => update({ productionName: e.target.value })}
          />
        </Field>
        <Field label="Subtitle">
          <input
            className="input"
            value={settings.productionSubtitle}
            onChange={(e) => update({ productionSubtitle: e.target.value })}
          />
        </Field>
        <Field label="Currency" hint="Applies to every amount as you move around the app.">
          <select
            className="input"
            value={settings.currency}
            onChange={(e) => update({ currency: e.target.value })}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <button className="btn-secondary mt-1 w-fit" onClick={reset}>
          Reset to defaults
        </button>
      </Section>

      {/* Data management */}
      <Section
        title="Data — Excel import"
        desc="Load the real Rejoice / Story 4 data extracted from the Excel tracker, or clear it to start manually from scratch."
      >
        {msg && (
          <div
            className={`rounded-xl px-3 py-2 text-sm ${
              msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {msg.text}
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 rounded-xl border border-slate-200 p-4">
            <div className="font-medium text-slate-800">Import Excel data</div>
            <p className="mt-1 text-sm text-slate-500">
              Writes {REJOICE_DOC_COUNT} items (locations, cast, crew, props, tasks, budget,
              contacts, risks, decisions) into the app. Safe to re-run — it overwrites by ID.
            </p>
            <button className="btn-primary mt-3 w-full sm:w-auto" onClick={doImport} disabled={!!busy}>
              {busy === 'import' ? 'Importing…' : 'Import from Excel'}
            </button>
          </div>

          <div className="flex-1 rounded-xl border border-rose-200 bg-rose-50/40 p-4">
            <div className="font-medium text-rose-800">Remove imported data</div>
            <p className="mt-1 text-sm text-slate-500">
              Deletes the items that came from the Excel import so you can build everything
              manually. Items you added yourself are kept.
            </p>
            <button className="btn-danger mt-3 w-full sm:w-auto" onClick={doClear} disabled={!!busy}>
              {busy === 'clear' ? 'Removing…' : 'Remove Excel data'}
            </button>
          </div>
        </div>
      </Section>

      {/* Info */}
      <Section title="About" desc="Read-only details.">
        <Info label="Owners" value={OWNERS.join(', ')} />
        <Info label="Firestore project space" value={`projects/${PROJECT_ID}`} />
        <Info label="App version" value="1.0.0" />
      </Section>
    </div>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card mb-5 p-4 sm:p-5">
      <h2 className="font-display text-lg font-semibold text-slate-800">{title}</h2>
      {desc && <p className="mt-0.5 text-sm text-slate-500">{desc}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sm:max-w-sm">
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="break-words text-sm font-medium text-slate-700 sm:text-right">{value}</span>
    </div>
  );
}
