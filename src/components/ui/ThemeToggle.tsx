import { useTheme, type Theme } from '../../contexts/ThemeContext';

const NEXT: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' };
const ICON: Record<Theme, string> = { light: '☀️', dark: '🌙', system: '🖥️' };
const LABEL: Record<Theme, string> = { light: 'Light', dark: 'Dark', system: 'System' };

// Cycles light → dark → system. Small icon button for the header / sidebar.
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(NEXT[theme])}
      aria-label={`Theme: ${LABEL[theme]}. Tap to change.`}
      title={`Theme: ${LABEL[theme]}`}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-base text-muted hover:bg-surface-2 ${className}`}
    >
      <span aria-hidden="true">{ICON[theme]}</span>
    </button>
  );
}
