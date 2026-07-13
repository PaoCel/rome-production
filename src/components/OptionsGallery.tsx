import { useMemo, useState } from 'react';
import type { EntityConfig } from '../data/entities';
import { linkedRequirementIds } from '../data/entities';
import type { EntityDoc } from '../types';
import { useCollection } from '../hooks/useCollection';
import { createItem, updateItem } from '../services/firestore';
import { deleteOptionCascade } from '../services/cascade';
import { addToBudget } from '../services/budget';
import { useAuth } from '../contexts/AuthContext';
import SearchInput from './ui/SearchInput';
import EmptyState from './ui/EmptyState';
import SidePanel from './ui/SidePanel';
import BottomSheet from './ui/BottomSheet';
import EntityForm from './form/EntityForm';
import MediaGallery from './MediaGallery';
import OptionCard from './OptionCard';
import OptionRow from './OptionRow';
import OptionDetail from './OptionDetail';

// The "CRM" view: every option being evaluated in a category, as photo cards,
// grouped/filtered by requirement. Complements the Requirements list view.
export default function OptionsGallery({ reqConfig }: { reqConfig: EntityConfig }) {
  const { canManage } = useAuth();
  const optionConfig = reqConfig.optionConfig!;
  const linkField = optionConfig.requirementLinkField || 'requirementId';
  const selField = reqConfig.selectedOptionField || 'selectedOptionId';
  const multi = !!optionConfig.multiRequirement;

  const { items: options, loading } = useCollection(optionConfig.collection);
  const { items: requirements } = useCollection(reqConfig.collection);

  const [search, setSearch] = useState('');
  const [reqFilter, setReqFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EntityDoc | null>(null);
  const [detail, setDetail] = useState<EntityDoc | null>(null);
  const [committingId, setCommittingId] = useState<string | null>(null);
  const [budgetMsg, setBudgetMsg] = useState('');
  const [newReqId, setNewReqId] = useState('');
  const [checklistReqIds, setChecklistReqIds] = useState<string[]>([]);

  const reqMap = useMemo(() => {
    const m = new Map<string, EntityDoc>();
    requirements.forEach((r) => m.set(r.id, r));
    return m;
  }, [requirements]);

  const idsFor = (o: EntityDoc) => (multi ? linkedRequirementIds(o, optionConfig) : [o[linkField]].filter(Boolean));

  const reqNames = (o: EntityDoc) => {
    const names = idsFor(o)
      .map((id) => reqMap.get(id)?.[reqConfig.titleField])
      .filter(Boolean);
    return names.length ? names.join(', ') : undefined;
  };
  const isSelected = (o: EntityDoc) => idsFor(o).some((id) => reqMap.get(id)?.[selField] === o.id);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return options.filter((o) => {
      if (reqFilter && !idsFor(o).includes(reqFilter)) return false;
      if (!q) return true;
      return Object.values(o).some((v) => typeof v === 'string' && v.toLowerCase().includes(q));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, reqFilter, search, linkField, multi]);

  const liveDetail = detail ? options.find((o) => o.id === detail.id) || null : null;

  function toggleChecklist(id: string) {
    setChecklistReqIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function startEdit(o: EntityDoc) {
    if (multi) setChecklistReqIds(linkedRequirementIds(o, optionConfig));
    setCreating(false);
    setEditing(o);
  }

  async function handleSubmit(values: Record<string, any>) {
    if (editing) {
      const payload = multi ? { ...values, [linkField]: checklistReqIds } : values;
      await updateItem(optionConfig.collection, editing.id, payload);
    } else if (multi) {
      if (checklistReqIds.length === 0) return;
      await createItem(optionConfig.collection, { ...values, [linkField]: checklistReqIds });
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
    const toClear = idsFor(o)
      .map((id) => reqMap.get(id))
      .filter((r): r is EntityDoc => !!r && r[selField] === o.id);
    await Promise.all(toClear.map((r) => updateItem(reqConfig.collection, r.id, { [selField]: '' })));
    if (detail?.id === o.id) setDetail(null);
  }

  async function select(o: EntityDoc) {
    const targetReqId = multi ? reqFilter : o[linkField];
    if (!targetReqId) return;
    const currentlySelected = reqMap.get(targetReqId)?.[selField] === o.id;
    await updateItem(reqConfig.collection, targetReqId, { [selField]: currentlySelected ? '' : o.id });
  }

  const selectDisabled = multi && !reqFilter;
  const selectDisabledReason = 'Filter by a role first';

  async function commit(o: EntityDoc) {
    if (!optionConfig.budgetSource || committingId) return;
    setCommittingId(o.id);
    try {
      const res = await addToBudget(optionConfig.budgetSource, o);
      setBudgetMsg(res === 'created' ? 'Committed to budget' : 'Budget updated');
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
    if (multi) {
      setChecklistReqIds(reqFilter ? [reqFilter] : []);
    } else {
      setNewReqId(reqFilter || (requirements[0]?.id ?? ''));
    }
    setEditing(null);
    setCreating(true);
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="text-lg font-semibold text-slate-800">Options</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
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
            className="btn-primary shrink-0"
            onClick={openCreate}
            disabled={noRequirements || !canManage}
            title={noRequirements ? 'Create a requirement first' : ''}
          >
            + New option
          </button>
        </div>
      </div>

      {budgetMsg && <p className="mb-3 text-sm text-emerald-600">{budgetMsg}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
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
      ) : optionConfig.layout === 'list' ? (
        <div className="space-y-2.5">
          {filtered.map((o) => (
            <OptionRow
              key={o.id}
              option={o}
              optionConfig={optionConfig}
              requirementName={reqNames(o)}
              isSelected={isSelected(o)}
              onOpen={() => setDetail(o)}
              onEdit={() => {
                if (!canManage) return;
                startEdit(o);
              }}
              onDelete={() => canManage && handleDelete(o)}
              readOnly={!canManage}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OptionCard
              key={o.id}
              option={o}
              optionConfig={optionConfig}
              requirementName={reqNames(o)}
              isSelected={isSelected(o)}
              committing={committingId === o.id}
              onOpen={() => setDetail(o)}
              onSelect={() => canManage && select(o)}
              onCommit={() => canManage && commit(o)}
              onEdit={() => {
                if (!canManage) return;
                startEdit(o);
              }}
              onDelete={() => canManage && handleDelete(o)}
              readOnly={!canManage}
              selectDisabled={selectDisabled}
              selectDisabledReason={selectDisabledReason}
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
        {multi ? (
          <div className="mb-4">
            <label className="label">{reqConfig.singular}s</label>
            <div className="flex flex-wrap gap-2">
              {requirements.map((r) => {
                const checked = checklistReqIds.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm ${
                      checked
                        ? 'border-brand-400 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-200"
                      checked={checked}
                      onChange={() => toggleChecklist(r.id)}
                    />
                    {r[reqConfig.titleField] || 'Untitled'}
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          creating &&
          !editing && (
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
          )
        )}

        <EntityForm
          fields={optionConfig.fields}
          initial={editing}
          submitLabel={editing ? 'Save changes' : `Add ${optionConfig.singular.toLowerCase()}`}
          onSubmit={handleSubmit}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />

        {optionConfig.relatedType && editing && (
          <div className="mt-6 border-t border-slate-200 pt-5">
            <MediaGallery relatedType={optionConfig.relatedType} relatedId={editing.id} hero />
          </div>
        )}
        {optionConfig.relatedType && creating && !editing && (
          <p className="mt-6 border-t border-slate-200 pt-5 text-xs text-slate-400">
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
            requirementName={reqNames(liveDetail)}
            isSelected={isSelected(liveDetail)}
            committing={committingId === liveDetail.id}
            budgetMsg={budgetMsg}
            onSelect={() => canManage && select(liveDetail)}
            onCommit={() => canManage && commit(liveDetail)}
            onEdit={() => {
              if (!canManage) return;
              startEdit(liveDetail);
              setDetail(null);
            }}
            readOnly={!canManage}
            selectDisabled={selectDisabled}
            selectDisabledReason={selectDisabledReason}
          />
        )}
      </SidePanel>
    </div>
  );
}
