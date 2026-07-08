import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout() {
  const { displayName, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <span className="text-base">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <Brand />
        <div className="mt-6 flex-1">{nav}</div>
        <UserBox name={displayName} onLogout={logout} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-slate-200 bg-white p-4">
            <Brand />
            <div className="mt-6 flex-1">{nav}</div>
            <UserBox name={displayName} onLogout={logout} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:hidden">
          <button
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-semibold text-slate-800">Rome Production</span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
        R
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-slate-800">Rome Production</div>
        <div className="text-xs text-slate-400">Production manager</div>
      </div>
    </div>
  );
}

function UserBox({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <div className="mb-2 flex items-center gap-2 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600">
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
