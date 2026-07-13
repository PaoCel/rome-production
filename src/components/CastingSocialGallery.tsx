import { useMemo, useState } from 'react';
import type { EntityConfig } from '../data/entities';
import type { CastingVoteValue } from '../services/castingVotes';
import type { EntityDoc } from '../types';
import { useCollection } from '../hooks/useCollection';
import { useAuth } from '../contexts/AuthContext';
import { addToBudget } from '../services/budget';
import { setCastingVote } from '../services/castingVotes';
import { deleteOptionCascade } from '../services/cascade';
import { createItem, updateItem } from '../services/firestore';
import BottomSheet from './ui/BottomSheet';
import EmptyState from './ui/EmptyState';
import SearchInput from './ui/SearchInput';
import EntityForm from './form/EntityForm';
import MediaGallery from './MediaGallery';
import CastProfileRow from './CastProfileRow';
import CastProfileModal from './CastProfileModal';
import type { CastingVoteCounts } from './CastingVoteControls';

const EMPTY_COUNTS: CastingVoteCounts = { likes: 0, dislikes: 0 };

export default function CastingSocialGallery({ reqConfig }: { reqConfig: EntityConfig }) {
  const { canManage, user } = useAuth();
  const optionConfig = reqConfig.optionConfig!;
  const linkField = optionConfig.requirementLinkField || 'requirementId';
  const selectedField = reqConfig.selectedOptionField || 'selectedOptionId';

  const { items: options, loading } = useCollection(optionConfig.collection);
  const { items: roles } = useCollection(reqConfig.collection);
  const { items: votes } = useCollection('castingVotes');
  const { items: contacts } = useCollection('contacts', canManage);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [minLikes, setMinLikes] = useState('');
  const [maxDislikes, setMaxDislikes] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EntityDoc | null>(null);
  const [detail, setDetail] = useState<EntityDoc | null>(null);
  const [newRoleId, setNewRoleId] = useState('');
  const [votingId, setVotingId] = useState<string | null>(null);
  const [voteError, setVoteError] = useState('');
  const [committingId, setCommittingId] = useState<string | null>(null);
  const [budgetMsg, setBudgetMsg] = useState('');

  const roleMap = useMemo(() => {
    const map = new Map<string, EntityDoc>();
    roles.forEach((role) => map.set(role.id, role));
    return map;
  }, [roles]);

  const voteState = useMemo(() => {
    const counts = new Map<string, CastingVoteCounts>();
    const mine = new Map<string, CastingVoteValue>();

    votes.forEach((vote) => {
      const optionId = typeof vote.optionId === 'string' ? vote.optionId : '';
      if (!optionId || (vote.value !== 'like' && vote.value !== 'dislike')) return;
      const current = counts.get(optionId) || { likes: 0, dislikes: 0 };
      if (vote.value === 'like') current.likes += 1;
      else current.dislikes += 1;
      counts.set(optionId, current);
      if (user?.uid && vote.voterId === user.uid) mine.set(optionId, vote.value);
    });

    return { counts, mine };
  }, [votes, user?.uid]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const minimumLikes = minLikes === '' ? null : Number(minLikes);
    const maximumDislikes = maxDislikes === '' ? null : Number(maxDislikes);
    return options.filter((option) => {
      if (roleFilter && option[linkField] !== roleFilter) return false;
      const counts = voteState.counts.get(option.id) || EMPTY_COUNTS;
      if (minimumLikes !== null && counts.likes < minimumLikes) return false;
      if (maximumDislikes !== null && counts.dislikes > maximumDislikes) return false;
      if (!query) return true;
      const role = roleMap.get(option[linkField]);
      const roleName = role?.[reqConfig.titleField];
      return [
        ...Object.values(option),
        roleName,
      ].some((value) => typeof value === 'string' && value.toLowerCase().includes(query));
    });
  }, [options, roleFilter, minLikes, maxDislikes, search, linkField, roleMap, reqConfig.titleField, voteState.counts]);

  const liveDetail = detail ? options.find((option) => option.id === detail.id) || null : null;

  function roleName(option: EntityDoc) {
    const role = roleMap.get(option[linkField]);
    return role ? role[reqConfig.titleField] : undefined;
  }

  function isSelected(option: EntityDoc) {
    const role = roleMap.get(option[linkField]);
    return !!role && role[selectedField] === option.id;
  }

  function countsFor(optionId: string) {
    return voteState.counts.get(optionId) || EMPTY_COUNTS;
  }

  function currentVoteFor(optionId: string) {
    return voteState.mine.get(optionId);
  }

  function openCreate() {
    setNewRoleId(roleFilter || roles[0]?.id || '');
    setEditing(null);
    setCreating(true);
  }

  async function handleSubmit(values: Record<string, any>) {
    if (editing) {
      await updateItem(optionConfig.collection, editing.id, values);
    } else {
      const roleId = roleFilter || newRoleId;
      if (!roleId) return;
      await createItem(optionConfig.collection, { ...values, [linkField]: roleId });
    }
    setCreating(false);
    setEditing(null);
  }

  async function handleDelete(option: EntityDoc) {
    if (!confirm(`Delete "${option[optionConfig.titleField] || 'this candidate'}"?`)) return;
    await deleteOptionCascade(optionConfig, option);
    const role = roleMap.get(option[linkField]);
    if (role && role[selectedField] === option.id) {
      await updateItem(reqConfig.collection, role.id, { [selectedField]: '' });
    }
    if (detail?.id === option.id) setDetail(null);
  }

  async function select(option: EntityDoc) {
    const roleId = option[linkField];
    if (!roleId) return;
    await updateItem(reqConfig.collection, roleId, {
      [selectedField]: isSelected(option) ? '' : option.id,
    });
  }

  async function commit(option: EntityDoc) {
    if (!optionConfig.budgetSource || committingId) return;
    setCommittingId(option.id);
    try {
      const result = await addToBudget(optionConfig.budgetSource, option);
      setBudgetMsg(result === 'created' ? 'Committed to budget' : 'Budget updated');
    } catch (error) {
      console.error(error);
      setBudgetMsg('Could not commit to budget. Try again.');
    } finally {
      setCommittingId(null);
      window.setTimeout(() => setBudgetMsg(''), 2500);
    }
  }

  async function vote(option: EntityDoc, value: CastingVoteValue) {
    if (!user || votingId) return;
    setVotingId(option.id);
    setVoteError('');
    try {
      const nextValue = currentVoteFor(option.id) === value ? null : value;
      await setCastingVote(option.id, user.uid, nextValue);
    } catch (error) {
      console.error(error);
      setVoteError('Your vote could not be saved. Please try again.');
    } finally {
      setVotingId(null);
    }
  }

  const noRoles = roles.length === 0;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-slate-900">Cast profiles</h1>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-sm font-semibold text-brand-600">
              {options.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Open a complete profile to vote or review its materials.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} />
          <select
            className="input w-full py-1.5 text-sm sm:w-auto sm:min-w-[12rem]"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role[reqConfig.titleField] || 'Untitled role'}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              className="input min-w-0 py-1.5 text-sm sm:w-28"
              value={minLikes}
              onChange={(event) => setMinLikes(event.target.value)}
              placeholder="Min likes"
              aria-label="Minimum number of likes"
            />
            <input
              type="number"
              min="0"
              inputMode="numeric"
              className="input min-w-0 py-1.5 text-sm sm:w-32"
              value={maxDislikes}
              onChange={(event) => setMaxDislikes(event.target.value)}
              placeholder="Max dislikes"
              aria-label="Maximum number of dislikes"
            />
          </div>
          {canManage && (
            <button
              type="button"
              className="btn-primary"
              onClick={openCreate}
              disabled={noRoles}
              title={noRoles ? 'Create a role first' : ''}
            >
              + New candidate
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : noRoles ? (
        <EmptyState title="No roles yet" hint="Create a role first, then add casting profiles." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={options.length === 0 ? 'No candidates yet' : 'No matches'}
          hint={options.length === 0 ? 'Add the first casting profile.' : 'Try clearing the search or role filter.'}
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((option) => (
            <CastProfileRow
              key={option.id}
              option={option}
              optionConfig={optionConfig}
              roleName={roleName(option)}
              counts={countsFor(option.id)}
              isSelected={isSelected(option)}
              onOpen={() => {
                setVoteError('');
                setDetail(option);
              }}
              onEdit={() => {
                setCreating(false);
                setEditing(option);
              }}
              onDelete={() => handleDelete(option)}
              readOnly={!canManage}
            />
          ))}
        </div>
      )}

      <BottomSheet
        open={creating || !!editing}
        title={editing ? 'Edit casting profile' : 'New casting profile'}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        {creating && !editing && (
          <div className="mb-4">
            <label className="label">Role</label>
            <select className="input" value={newRoleId} onChange={(event) => setNewRoleId(event.target.value)}>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role[reqConfig.titleField] || 'Untitled role'}
                </option>
              ))}
            </select>
          </div>
        )}

        <EntityForm
          fields={optionConfig.fields}
          initial={editing}
          contacts={contacts}
          submitLabel={editing ? 'Save changes' : 'Add candidate'}
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
            Save the profile first, then reopen it to upload photos. The first uploaded photo becomes the avatar.
          </p>
        )}
      </BottomSheet>

      {liveDetail && (
        <CastProfileModal
          option={liveDetail}
          optionConfig={optionConfig}
          roleName={roleName(liveDetail)}
          counts={countsFor(liveDetail.id)}
          currentVote={currentVoteFor(liveDetail.id)}
          voting={votingId === liveDetail.id}
          voteError={voteError}
          isSelected={isSelected(liveDetail)}
          committing={committingId === liveDetail.id}
          budgetMsg={budgetMsg}
          readOnly={!canManage}
          onClose={() => {
            setDetail(null);
            setVoteError('');
          }}
          onVote={(value) => vote(liveDetail, value)}
          onSelect={() => select(liveDetail)}
          onCommit={() => commit(liveDetail)}
          onEdit={() => {
            setEditing(liveDetail);
            setDetail(null);
          }}
        />
      )}
    </div>
  );
}
