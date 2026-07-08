// A row of dropdown filters. Each filter is {name,label,options}.
export interface FilterDef {
  name: string;
  label: string;
  options: string[];
}

export default function FilterBar({
  filters,
  values,
  onChange,
}: {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <select
          key={f.name}
          className="input w-auto min-w-[8rem] py-1.5 text-sm"
          value={values[f.name] || ''}
          onChange={(e) => onChange(f.name, e.target.value)}
        >
          <option value="">All {f.label.toLowerCase()}</option>
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
