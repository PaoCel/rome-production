import { useMemo, useState } from 'react';
import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
import { useCollection } from '../hooks/useCollection';
import { createItem, updateItem } from '../services/firestore';
import { deleteOptionCascade } from '../services/cascade';
import { addToBudget } from '../services/budget';
import SearchInput from './ui/SearchInput';
import EmptyState from './ui/EmptyState';
import SidePanel from './ui/SidePanel';
import BottomSheet from './ui/BottomSheet';
import EntityForm from './form/EntityForm';
import MediaGallery from './MediaGallery';
import OptionCard from './OptionCard';
import OptionDetail from './OptionDetail';
import Fab from './ui/Fab';

// The "CRM" view: every option being evaluated in a category, as photo cards,
// grouped/filtered by requirement. Complements the Requirements list view.
export default function OptionsGallery({ reqConfig }: { reqConfig: EntityConfig }) {
  const optionConfig = reqConfig.optionConfig!;
  const linkField = optionConfig.requirementLinkField || 'requirementId';
  const selField = reqConfig.selectedOptionField || 'selectedOptionId';

  const { items: options, loading } = useCollection(optionConfig.collection);
  const { items: requirements } = useCollection(reqConfig.collection);
  const { items: contacts } = useCollection('contacts');

  const [search, setSearch] = useState('');
  const [reqFilter, setReqFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EntityDoc | null>(null);
  const [detail, setDetail] = useState<EntityDoc | null>(null);
  const [committingId, setCommittingId] = useState<string | null>(null);
  const [budgetMsg, setBudgetMsg] = useState('');
  const [newReqId, setNewReqId] = useState('');

  const reqMap = useMemo(() => {
    const m = new Map<string, EntityDoc>();
    requirements.forEach((r) => m.set(r.id, r));
    return m;
  }, [requirements]);

  const reqName = (o: EntityDoc) => {
    const r = reqMap.get(o[linkField]);
    return r ? r[reqConfig.titleField] : undefined;
  };
  const isSelected = (o: EntityDoc) => {
    const r = reqMap.get(o[linkField]);
    return !!r && r[selField] === o.id;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return options.filter((o) => {
      if (reqFilter && o[linkField] !== reqFilter) return false;
      if (!q) return true;
      return Object.values(o).some((v) => typeof v === 'string' && v.toLowerCase().includes(q));
    });
  }, [options, reqFilter, search, linkField]);

  const liveDetail = detail ? options.find((o) => o.id === detail.id) || null : null;

  async function handleSubmit(values: Record<string, any>) {
    if (editing) {
      await updateItem(optionConfig.collection, editing.id, values);
    } else {
      const reqId = reqFilter || newReqId;
      if (!reqId) return;
      await createItem(optionConfig.collection, { ...values, [linkField]: reqId });
    }
    setCreating(false);
    setEditing(null);
  }

  async function handleDelete(o: EntityDoc) {
    if (!confirm(`Delete "${o[optionConfig.titleField] || 'this option'}"?`)) return;
    await deleteOptionCascade(optionConfig, o);
    const r = reqMap.get(o[linkField]);
    if (r && r[selField] === o.id) {
      await updateItem(reqConfig.collection, r.id, { [selField]: '' });
    }
    if (detail?.id === o.id) setDetail(null);
  }

  async function select(o: EntityDoc) {
    const reqId = o[linkField];
    if (!reqId) return;
    const next = isSelected(o) ? '' : o.id;
    await updateItem(reqConfig.collection, reqId, { [selField]: next });
  }

  async function commit(o: EntityDoc) {
    if (!optionConfig.budgetSource || committingId) return;
    setCommittingId(o.id);
    try {
      const res = await addToBudget(optionConfig.budgetSource, o);
      setBudgetMsg(res === 'created' ? 'Committed to budget ✓' : 'Budget updated ✓');
    } catch (err) {
      console.error(err);
      setBudgetMsg('Could not commit to budget. Try again.');
    } finally {
      setCommittingId(null);
      setTimeout(() => setBudgetMsg(''), 2500);
    }
  }

  const noRequirements = requirements.length === 0;

  function openCreate() {
    setNewReqId(reqFilter || (requirements[0]?.id ?? ''));
    setEditing(null);
    setCreating(true);
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="text-lg font-semibold text-ink">Options</span>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
            {options.length}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} />
          <select
            className="input w-full py-1.5 text-sm sm:w-auto sm:min-w-[12rem]"
            value={reqFilter}
            onChange={(e) => setReqFilter(e.target.value)}
          >
            <option value="">All {reqConfig.singular.toLowerCase()}s</option>
            {requirements.map((r) => (
              <option key={r.id} value={r.id}>
                {r[reqConfig.titleField] || 'Untitled'}
              </option>
            ))}
          </select>
          <button
            className="btn-primary hidden shrink-0 sm:inline-flex"
            onClick={openCreate}
            disabled={noRequirements}
            title={noRequirements ? 'Create a requirement first' : ''}
          >
            + New option
          </button>
        </div>
      </div>

      {!noRequirements && <Fab onClick={openCreate} label="New option" />}

      {budgetMsg && <p className="mb-3 text-sm text-emerald-600">{budgetMsg}</p>}

      {loading ? (
        <p className="text-sm text-faint">Loading…</p>
      ) : noRequirements ? (
        <EmptyState
          title={`No ${reqConfig.singular.toLowerCase()}s yet`}
          hint={`Switch to the ${reqConfig.singular} view and add one, then attach options here.`}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={options.length === 0 ? 'No options yet' : 'No matches'}
          hint={options.length === 0 ? 'Add the candidates you are evaluating.' : 'Try clearing the filter.'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OptionCard
              key={o.id}
              option={o}
              optionConfig={optionConfig}
              requirementName={reqName(o)}
              isSelected={isSelected(o)}
              committing={committingId === o.id}
              onOpen={() => setDetail(o)}
              onSelect={() => select(o)}
              onCommit={() => commit(o)}
              onEdit={() => {
                setCreating(false);
                setEditing(o);
              }}
              onDelete={() => handleDelete(o)}
            />
          ))}
        </div>
      )}

      {/* Create / edit option */}
      <BottomSheet
        open={creating || !!editing}
        title={editing ? `Edit ${optionConfig.singular.toLowerCase()}` : `New ${optionConfig.singular.toLowerCase()}`}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        {creating && !editing && (
          <div className="mb-4">
            <label className="label">{reqConfig.singular}</label>
            <select
              className="input"
              value={newReqId}
              onChange={(e) => setNewReqId(e.target.value)}
            >
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>
                  {r[reqConfig.titleField] || 'Untitled'}
                </option>
              ))}
            </select>
          </div>
        )}

        <EntityForm
          fields={optionConfig.fields}
          initial={editing}
          contacts={contacts}
          submitLabel={editing ? 'Save changes' : `Add ${optionConfig.singular.toLowerCase()}`}
          onSubmit={handleSubmit}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />

        {optionConfig.relatedType && editing && (
          <div className="mt-6 border-t border-line pt-5">
            <MediaGallery relatedType={optionConfig.relatedType} relatedId={editing.id} hero />
          </div>
        )}
        {optionConfig.relatedType && creating && !editing && (
          <p className="mt-6 border-t border-line pt-5 text-xs text-faint">
            Save this option first, then reopen it to add photos and files.
          </p>
        )}
      </BottomSheet>

      {/* Option detail */}
      <SidePanel
        open={!!liveDetail}
        title={`${optionConfig.singular} details`}
        onClose={() => setDetail(null)}
        wide
      >
        {liveDetail && (
          <OptionDetail
            option={liveDetail}
            optionConfig={optionConfig}
            requirementName={reqName(liveDetail)}
            isSelected={isSelected(liveDetail)}
            committing={committingId === liveDetail.id}
            budgetMsg={budgetMsg}
            onSelect={() => select(liveDetail)}
            onCommit={() => commit(liveDetail)}
            onEdit={() => {
              setEditing(liveDetail);
              setDetail(null);
            }}
          />
        )}
      </SidePanel>
    </div>
  );
}
