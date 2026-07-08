import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { NAV_GROUPS } from './navItems';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export default function AppLayout() {
  const { displayName, logout } = useAuth();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((section) => (
        <div key={section.group}>
          <div className="mb-1.5 px-3 section-label">{section.group}</div>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600 transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-dvh min-w-0">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200/80 bg-white/70 p-4 backdrop-blur-sm md:flex">
        <Brand />
        <div className="mt-6 flex-1 overflow-y-auto">{nav}</div>
        <UserBox name={displayName} onLogout={logout} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col border-r border-slate-200 bg-white p-4 shadow-panel">
            <Brand />
            <div className="mt-6 flex-1 overflow-y-auto">{nav}</div>
            <UserBox name={displayName} onLogout={logout} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur md:hidden">
          <button
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="min-w-0 flex items-center gap-2 font-semibold text-slate-800">
            <span className="shrink-0">🎬</span>
            <span className="truncate">{settings.productionName}</span>
          </span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand() {
  const { settings } = useSettings();
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg shadow-sm">
        🎬
      </div>
      <div className="leading-tight">
        <div className="font-display text-[15px] font-semibold text-slate-800">
          {settings.productionName}
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-accent-600">
          {settings.productionSubtitle}
        </div>
      </div>
    </div>
  );
}

function UserBox({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <div className="mt-4 border-t border-slate-200/80 pt-4">
      <div className="mb-2 flex items-center gap-2 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {name.charAt(0).toUpperCase()}
        </div>
        <span className="truncate text-sm font-medium text-slate-700">{name}</span>
      </div>
      <button className="btn-secondary w-full" onClick={onLogout}>
        Log out
      </button>
    </div>
  );
}
