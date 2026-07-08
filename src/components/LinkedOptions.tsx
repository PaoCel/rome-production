import { useState } from 'react';
import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
import { useCollection } from '../hooks/useCollection';
import { createItem, updateItem } from '../services/firestore';
import { addToBudget } from '../services/budget';
import { deleteOptionCascade } from '../services/cascade';
import EntityForm from './form/EntityForm';
import MediaGallery from './MediaGallery';
import Pill from './ui/Pill';
import Money from './ui/Money';

// Renders the options that fulfil a requirement (the second tier of the
// requirement → option model). Lets you add/edit options, pick the winning
// one, and commit it to the budget. Mirrors the pattern used by RelatedTasks.
export default function LinkedOptions({
  config,
  requirement,
}: {
  config: EntityConfig; // the requirement config (must have optionConfig)
  requirement: EntityDoc;
}) {
  const optionConfig = config.optionConfig!;
  const linkField = optionConfig.requirementLinkField || 'requirementId';
  const selectedField = config.selectedOptionField || 'selectedOptionId';

  const { items: allOptions } = useCollection(optionConfig.collection);
  const { items: contacts } = useCollection('contacts');

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EntityDoc | null>(null);
  const [budgetMsg, setBudgetMsg] = useState('');
  const [committingId, setCommittingId] = useState<string | null>(null);

  const options = allOptions.filter((o) => o[linkField] === requirement.id);
  const selectedId = requirement[selectedField] as string | undefined;

  async function handleSubmit(values: Record<string, any>) {
    if (editing) {
      await updateItem(optionConfig.collection, editing.id, values);
    } else {
      await createItem(optionConfig.collection, { ...values, [linkField]: requirement.id });
    }
    setCreating(false);
    setEditing(null);
  }

  async function handleDelete(o: EntityDoc) {
    if (!confirm(`Delete "${o[optionConfig.titleField] || 'this option'}"?`)) return;
    // Cascade: also removes the option's media, comments and budget item.
    await deleteOptionCascade(optionConfig, o);
    if (selectedId === o.id) {
      await updateItem(config.collection, requirement.id, { [selectedField]: '' });
    }
  }

  async function select(o: EntityDoc) {
    const next = selectedId === o.id ? '' : o.id;
    await updateItem(config.collection, requirement.id, { [selectedField]: next });
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

  const showForm = creating || !!editing;

  return (
    <section>
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-sm font-semibold text-slate-700">
          Options{' '}
          {options.length > 0 && <span className="text-slate-400">({options.length})</span>}
        </h4>
        {!showForm && (
          <button
            className="btn-secondary w-full px-2.5 py-1.5 text-xs sm:w-auto"
            onClick={() => {
              setEditing(null);
              setCreating(true);
            }}
          >
            + Add option
          </button>
        )}
      </div>

      {budgetMsg && <p className="mb-2 text-sm text-emerald-600">{budgetMsg}</p>}

      {/* Option list */}
      <div className="space-y-2">
        {options.map((o) => {
          const isSelected = selectedId === o.id;
          const pills = optionConfig.pillFields
            .map((n) => o[n])
            .filter(Boolean) as string[];
          const cost = optionConfig.costField ? o[optionConfig.costField] : undefined;
          return (
            <div
              key={o.id}
              className={`rounded-lg border bg-white p-3 transition ${
                isSelected ? 'border-brand-400 ring-1 ring-brand-200' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-words font-medium text-slate-800">
                      {o[optionConfig.titleField] || 'Untitled option'}
                    </span>
                    {isSelected && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
                        Selected
                      </span>
                    )}
                  </div>
                  {pills.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {pills.map((p, i) => (
                        <Pill key={i} value={p} />
                      ))}
                    </div>
                  )}
                </div>
                {cost ? (
                  <span className="text-sm font-medium text-slate-700 sm:shrink-0">
                    <Money value={cost} />
                  </span>
                ) : null}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-2.5 sm:flex sm:flex-wrap sm:items-center">
                <button
                  className={
                    isSelected
                      ? 'btn-primary px-2.5 py-1.5 text-xs'
                      : 'btn-secondary px-2.5 py-1.5 text-xs'
                  }
                  onClick={() => select(o)}
                >
                  {isSelected ? '✓ Selected' : 'Select'}
                </button>
                {optionConfig.budgetSource && (
                  <button
                    className="btn-secondary px-2.5 py-1.5 text-xs"
                    onClick={() => commit(o)}
                    disabled={!isSelected || committingId === o.id}
                    title={isSelected ? '' : 'Select this option first'}
                  >
                    {committingId === o.id ? 'Committing…' : 'Commit to budget'}
                  </button>
                )}
                <button
                  className="btn-secondary px-2.5 py-1.5 text-xs"
                  onClick={() => {
                    setCreating(false);
                    setEditing(o);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-danger px-2.5 py-1.5 text-xs"
                  onClick={() => handleDelete(o)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {options.length === 0 && !showForm && (
          <p className="rounded-lg border border-dashed border-slate-200 py-5 text-center text-xs text-slate-400">
            No options yet. Add a few candidates to compare.
          </p>
        )}
      </div>

      {/* Inline add / edit form */}
      {showForm && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-700">
            {editing ? 'Edit option' : 'New option'}
          </div>
          <EntityForm
            fields={optionConfig.fields}
            initial={editing}
            contacts={contacts}
            submitLabel={editing ? 'Save option' : 'Add option'}
            onSubmit={handleSubmit}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
          {optionConfig.media && optionConfig.relatedType && editing && (
            <div className="mt-5 border-t border-slate-200 pt-4">
              <MediaGallery relatedType={optionConfig.relatedType} relatedId={editing.id} />
            </div>
          )}
          {optionConfig.media && creating && (
            <p className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-400">
              Save this option first, then reopen it to add photos and files.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
