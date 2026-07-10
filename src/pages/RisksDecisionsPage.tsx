import { useState } from 'react';
import CrudPage from '../components/CrudPage';
import { DECISION_CONFIG, RISK_CONFIG } from '../data/entities';
import AppIcon from '../components/icons/AppIcon';

export default function RisksDecisionsPage() {
  const [tab, setTab] = useState<'risks' | 'decisions'>('risks');

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 rounded-lg border border-slate-200 bg-white p-1 sm:inline-flex">
        <TabButton active={tab === 'risks'} onClick={() => setTab('risks')}>
          <AppIcon name="risks" className="h-4 w-4" />
          Risks
        </TabButton>
        <TabButton active={tab === 'decisions'} onClick={() => setTab('decisions')}>
          <AppIcon name="decisions" className="h-4 w-4" />
          Decisions
        </TabButton>
      </div>

      {tab === 'risks' ? (
        <CrudPage config={RISK_CONFIG} />
      ) : (
        <CrudPage config={DECISION_CONFIG} />
      )}
    </div>
  );
}

function TabButton({
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
        active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
