import { useEffect, useRef, useState } from 'react';
import FilterSheet, { FilterButton, FilterChips, activeFilterCount, type FilterDef } from './FilterSheet';

export type { FilterDef };

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
          <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-line bg-surface p-4 shadow-card-hover">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-ink">Filtri</span>
              <button type="button" onClick={onClear} className="text-sm font-medium text-brand-600 hover:text-brand-700">
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
