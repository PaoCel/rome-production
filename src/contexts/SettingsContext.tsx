import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setCurrency } from '../utils/format';

// App-wide preferences, persisted to localStorage. Kept intentionally small
// so every entry here actually does something.
export interface Settings {
  productionName: string;
  productionSubtitle: string;
  currency: string; // ISO code: EUR | USD | GBP
}

export const DEFAULT_SETTINGS: Settings = {
  productionName: 'Rome Production',
  productionSubtitle: 'Rejoice · Story 4',
  currency: 'EUR',
};

export const CURRENCIES = ['EUR', 'USD', 'GBP'];

const STORAGE_KEY = 'rome-settings';

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_SETTINGS };
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);

  // Keep dependent systems in sync (currency drives money formatting).
  useEffect(() => {
    setCurrency(settings.currency);
    document.title = `${settings.productionName} · ${settings.productionSubtitle}`;
  }, [settings.currency, settings.productionName, settings.productionSubtitle]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      update: (patch) =>
        setSettings((s) => {
          const next = { ...s, ...patch };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return next;
        }),
      reset: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setSettings({ ...DEFAULT_SETTINGS });
      },
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
