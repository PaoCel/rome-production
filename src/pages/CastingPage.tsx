import { useState } from 'react';
import CastingSocialGallery from '../components/CastingSocialGallery';
import CrudPage from '../components/CrudPage';
import { CAST_ROLE_CONFIG } from '../data/entities';

export default function CastingPage() {
  const [view, setView] = useState<'candidates' | 'roles'>('candidates');

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
        <Tab active={view === 'candidates'} onClick={() => setView('candidates')}>
          Candidates
        </Tab>
        <Tab active={view === 'roles'} onClick={() => setView('roles')}>
          Roles
        </Tab>
      </div>

      {view === 'candidates' ? (
        <CastingSocialGallery reqConfig={CAST_ROLE_CONFIG} />
      ) : (
        <CrudPage config={CAST_ROLE_CONFIG} />
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
        active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
