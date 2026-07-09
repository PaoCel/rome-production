import BottomSheet from './BottomSheet';

export interface FilterDef {
  name: string;
  label: string;
  options: string[];
}

export function activeFilterCount(values: Record<string, string>): number {
  return Object.values(values).filter(Boolean).length;
}

export function FilterButton({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-sm hover:border-line hover:bg-surface-2"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 4h14l-5.5 6.5V16l-3 1.5v-7L3 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      Filtri
      {activeCount > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
          {activeCount}
        </span>
      )}
    </button>
  );
}

export default function FilterSheet({
  open,
  onClose,
  filters,
  values,
  onChange,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onClear: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      title="Filtri"
      onClose={onClose}
      footer={
        <button type="button" className="btn-primary w-full" onClick={onClose}>
          Applica
        </button>
      }
    >
      <div className="mb-3 flex items-center justify-end">
        <button type="button" onClick={onClear} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Azzera
        </button>
      </div>

      <FilterChips filters={filters} values={values} onChange={onChange} />
    </BottomSheet>
  );
}

export function FilterChips({
  filters,
  values,
  onChange,
}: {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {filters.map((f) => (
        <div key={f.name}>
          <div className="label mb-2">{f.label}</div>
          <div className="flex flex-wrap gap-2">
            {f.options.map((o) => {
              const selected = values[f.name] === o;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => onChange(f.name, selected ? '' : o)}
                  className={`min-h-10 rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                    selected
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                      : 'border-line bg-surface text-muted hover:border-line'
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
