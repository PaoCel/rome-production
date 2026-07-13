import { COMMON_LANGUAGES, LANGUAGE_LEVELS } from '../../data/constants';
import type { LanguageEntry } from '../../types';

// Repeatable language + proficiency-level row editor for crew/casting profiles.
export default function LanguagesField({
  value,
  onChange,
}: {
  value: LanguageEntry[];
  onChange: (next: LanguageEntry[]) => void;
}) {
  const rows = value || [];

  function update(index: number, patch: Partial<LanguageEntry>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function remove(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...rows, { language: '', level: LANGUAGE_LEVELS[0] }]);
  }

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            list="common-languages"
            className="input flex-1"
            placeholder="Language"
            value={row.language}
            onChange={(e) => update(i, { language: e.target.value })}
          />
          <select
            className="input w-36 shrink-0"
            value={row.level}
            onChange={(e) => update(i, { level: e.target.value })}
          >
            {LANGUAGE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="shrink-0 px-1.5 text-lg leading-none text-slate-300 hover:text-red-500"
            onClick={() => remove(i)}
            aria-label="Remove language"
          >
            ×
          </button>
        </div>
      ))}

      <datalist id="common-languages">
        {COMMON_LANGUAGES.map((lang) => (
          <option key={lang} value={lang} />
        ))}
      </datalist>

      <button type="button" className="btn-secondary py-1.5 text-xs" onClick={add}>
        + Add language
      </button>
    </div>
  );
}
