import BottomSheet from './BottomSheet';

export interface FilterDef {
  name: string;
  label: string;
  options: string[];
}

// Count of active (truthy) filter values — used for the FilterButton badge.
export function activeFilterCount(values: Record<string, string>): number {
  return Object.values(values).filter(Boolean).length;
}

// "Filtri" trigger button, with a badge when filters are active.
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
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-sm hover:border-line hover:bg-surface-2"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 4h14l-5.5 6.5V16l-3 1.5v-7L3 4z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
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

// Bottom-sheet filter UI: one chip row per filter definition.
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
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Azzera
        </button>
      </div>

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
                    className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                      selected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15 text-brand-700'
                        : 'border-line bg-surface text-muted'
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
    </BottomSheet>
  );
}
