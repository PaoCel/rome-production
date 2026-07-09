import { useEffect, useRef, useState } from 'react';
import FilterSheet, { FilterButton, activeFilterCount, type FilterDef } from './FilterSheet';

// Shared chip row used by the desktop popover (FilterSheet renders its own
// copy internally for the mobile bottom sheet).
function FilterChips({
  filters,
  values,
  onChange,
}: {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
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
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-slate-600'
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

// "Filtri" control: a bottom sheet on mobile, an anchored popover on desktop.
export default function FilterControl({
  filters,
  values,
  onChange,
  onClear,
}: {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <FilterButton activeCount={activeFilterCount(values)} onClick={() => setOpen((o) => !o)} />

      <div className="lg:hidden">
        <FilterSheet
          open={open}
          onClose={() => setOpen(false)}
          filters={filters}
          values={values}
          onChange={onChange}
          onClear={onClear}
        />
      </div>

      <div className="hidden lg:block">
        {open && (
          <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-card-hover">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Filtri</span>
              <button
                type="button"
                onClick={onClear}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Azzera
              </button>
            </div>
            <FilterChips filters={filters} values={values} onChange={onChange} />
          </div>
        )}
      </div>
    </div>
  );
}
