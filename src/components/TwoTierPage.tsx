import { useState } from 'react';
import type { EntityConfig } from '../data/entities';
import CrudPage from './CrudPage';
import OptionsGallery from './OptionsGallery';

// A category with the requirement → option model. Toggles between the
// "Options" CRM gallery (default) and the "Requirements" list.
export default function TwoTierPage({ config }: { config: EntityConfig }) {
  const [view, setView] = useState<'options' | 'requirements'>('options');

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
        <Tab active={view === 'options'} onClick={() => setView('options')}>
          Options
        </Tab>
        <Tab active={view === 'requirements'} onClick={() => setView('requirements')}>
          Requirements
        </Tab>
      </div>

      {view === 'options' ? (
        <OptionsGallery reqConfig={config} />
      ) : (
        <CrudPage config={config} />
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
