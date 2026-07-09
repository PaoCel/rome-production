import { useState } from 'react';
import CrudPage from '../components/CrudPage';
import { DECISION_CONFIG, RISK_CONFIG } from '../data/entities';

export default function RisksDecisionsPage() {
  const [tab, setTab] = useState<'risks' | 'decisions'>('risks');

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 rounded-xl border border-line bg-surface p-1 sm:inline-flex">
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
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
        active ? 'bg-brand-600 text-white' : 'text-muted hover:bg-surface-2'
      }`}
    >
      {children}
    </button>
  );
}
