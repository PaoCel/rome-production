/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // User theme choice stamps data-theme="dark" on <html>; "system" falls back
  // to the prefers-color-scheme media query handled in index.css.
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'ui-serif', 'serif'],
      },
      colors: {
        // Semantic tokens resolved from CSS variables so they follow the active
        // theme. Prefer these (bg-surface, text-ink, border-line…) over raw
        // slate/white classes, which are light-only.
        page: 'var(--page)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--line)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        good: 'var(--good)',
        warn: 'var(--warn)',
        crit: 'var(--crit)',
        info: 'var(--info)',
        violet: 'var(--violet)',
        // Primary brand (indigo) — full scale for depth.
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Warm accent used sparingly for the "film" feel.
        accent: {
          50: '#fdf6ec',
          100: '#fae9cf',
          500: '#d99a2b',
          600: '#b97d16',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.05)',
        panel: '-12px 0 40px rgba(15, 23, 42, 0.10)',
      },
    },
  },
  plugins: [],
};
