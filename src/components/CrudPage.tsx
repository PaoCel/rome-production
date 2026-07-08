import { useMemo, useState } from 'react';
import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';
import { useCollection } from '../hooks/useCollection';
import { createItem, deleteItem, updateItem } from '../services/firestore';
import { OWNERS } from '../data/owners';
import PageHeader from './PageHeader';
import SearchInput from './ui/SearchInput';
import FilterBar, { type FilterDef } from './ui/FilterBar';
import EmptyState from './ui/EmptyState';
import EntityCard from './EntityCard';
import EntityForm from './form/EntityForm';
import EntityDetail from './EntityDetail';
import MediaGallery from './MediaGallery';
import SidePanel from './ui/SidePanel';

// One reusable page powering every card-based CRUD section.
export default function CrudPage({ config }: { config: EntityConfig }) {
  const { items, loading } = useCollection(config.collection);
  const { items: contacts } = useCollection('contacts');

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<EntityDoc | null>(null);
  const [editing, setEditing] = useState<EntityDoc | null>(null);
  const [creating, setCreating] = useState(false);

  const filterDefs: FilterDef[] = useMemo(
    () => config.filters.map((name) => buildFilter(name, config, items)),
    [config, items],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      for (const [name, value] of Object.entries(filters)) {
        if (value && String(item[name] ?? '') !== value) return false;
      }
      if (!q) return true;
      return Object.values(item).some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(q),
      );
    });
  }, [items, filters, search]);

  // Keep the open detail panel in sync with live data.
  const liveDetail = detail ? items.find((i) => i.id === detail.id) || null : null;

  async function handleSubmit(values: Record<string, any>) {
    if (editing) {
      await updateItem(config.collection, editing.id, values);
    } else {
      await createItem(config.collection, values);
    }
    setCreating(false);
    setEditing(null);
  }

  async function handleDelete(item: EntityDoc) {
    if (!confirm(`Delete "${item[config.titleField] || 'this item'}"?`)) return;
    await deleteItem(config.collection, item.id);
    if (detail?.id === item.id) setDetail(null);
  }

  return (
    <div>
      <PageHeader
        title={`${config.singular}s`}
        count={items.length}
        action={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + New {config.singular.toLowerCase()}
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} />
        <FilterBar
          filters={filterDefs}
          values={filters}
          onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value }))}
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? `No ${config.singular.toLowerCase()}s yet` : 'No matches'}
          hint={items.length === 0 ? 'Create your first one to get started.' : 'Try clearing filters.'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <EntityCard
              key={item.id}
              config={config}
              item={item}
              onOpen={() => setDetail(item)}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit */}
      <SidePanel
        open={creating || !!editing}
        title={editing ? `Edit ${config.singular.toLowerCase()}` : `New ${config.singular.toLowerCase()}`}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        <EntityForm
          fields={config.fields}
          initial={editing}
          contacts={contacts}
          submitLabel={editing ? 'Save changes' : `Create ${config.singular.toLowerCase()}`}
          onSubmit={handleSubmit}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />

        {/* Media upload while editing an existing item. */}
        {config.media && config.relatedType && editing && (
          <div className="mt-6 border-t border-slate-200 pt-5">
            <MediaGallery relatedType={config.relatedType} relatedId={editing.id} />
          </div>
        )}
        {config.media && config.relatedType && creating && !editing && (
          <p className="mt-6 border-t border-slate-200 pt-5 text-xs text-slate-400">
            Save this {config.singular.toLowerCase()} first, then reopen it to upload photos and files.
          </p>
        )}
      </SidePanel>

      {/* Detail */}
      <SidePanel
        open={!!liveDetail}
        title={`${config.singular} details`}
        onClose={() => setDetail(null)}
        wide
      >
        {liveDetail && (
          <EntityDetail
            config={config}
            item={liveDetail}
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

function buildFilter(name: string, config: EntityConfig, items: EntityDoc[]): FilterDef {
  const field = config.fields.find((f) => f.name === name);
  const label = field?.label || name;
  let options: string[] = [];
  if (field?.options) options = field.options;
  else if (field?.type === 'owner') options = [...OWNERS];
  else {
    // Derive unique values from the data.
    options = Array.from(
      new Set(items.map((i) => i[name]).filter((v) => typeof v === 'string' && v)),
    ).sort();
  }
  return { name, label, options };
}
