import { useState } from 'react';
import CrudPage from '../components/CrudPage';
import { DECISION_CONFIG, RISK_CONFIG } from '../data/entities';

export default function RisksDecisionsPage() {
  const [tab, setTab] = useState<'risks' | 'decisions'>('risks');

  return (
    <div>
      <div className="mb-5 inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <TabButton active={tab === 'risks'} onClick={() => setTab('risks')}>
          ⚠️ Risks
        </TabButton>
        <TabButton active={tab === 'decisions'} onClick={() => setTab('decisions')}>
          🧭 Decisions
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
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
        active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
