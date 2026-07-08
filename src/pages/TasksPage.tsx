import { useMemo, useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { createItem, deleteItem, updateItem } from '../services/firestore';
import { TASK_PRIORITIES, TASK_STATUSES } from '../data/constants';
import { OWNERS } from '../data/owners';
import type { EntityConfig } from '../data/entities';
import type { EntityDoc, FieldConfig } from '../types';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import FilterBar from '../components/ui/FilterBar';
import Pill from '../components/ui/Pill';
import EmptyState from '../components/ui/EmptyState';
import SidePanel from '../components/ui/SidePanel';
import EntityForm from '../components/form/EntityForm';
import EntityDetail from '../components/EntityDetail';
import CardMenu from '../components/ui/CardMenu';
import { formatDate } from '../utils/format';

const TASK_FIELDS: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', full: true },
  { name: 'area', label: 'Area', type: 'text' },
  { name: 'owner', label: 'Owner', type: 'owner' },
  { name: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITIES },
  { name: 'status', label: 'Status', type: 'select', options: TASK_STATUSES },
  { name: 'dueDate', label: 'Due date', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
];

const TASK_CONFIG: EntityConfig = {
  collection: 'tasks',
  singular: 'Task',
  titleField: 'title',
  subtitleFields: ['area'],
  pillFields: ['priority', 'status'],
  filters: [],
  relatedType: 'task',
  comments: true,
  fields: TASK_FIELDS,
};

export default function TasksPage() {
  const { items, loading } = useCollection('tasks');
  const [view, setView] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<EntityDoc | null>(null);
  const [editing, setEditing] = useState<EntityDoc | null>(null);
  const [creating, setCreating] = useState(false);

  const filterDefs = [
    { name: 'owner', label: 'Owner', options: [...OWNERS] },
    { name: 'priority', label: 'Priority', options: TASK_PRIORITIES },
    { name: 'status', label: 'Status', options: TASK_STATUSES },
    {
      name: 'area',
      label: 'Area',
      options: Array.from(
        new Set(items.map((i) => i.area).filter((v): v is string => typeof v === 'string' && !!v)),
      ).sort(),
    },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((t) => {
      for (const [name, value] of Object.entries(filters)) {
        if (value && String(t[name] ?? '') !== value) return false;
      }
      if (!q) return true;
      return [t.title, t.description, t.area].some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(q),
      );
    });
  }, [items, filters, search]);

  const liveDetail = detail ? items.find((i) => i.id === detail.id) || null : null;

  async function handleSubmit(values: Record<string, any>) {
    const payload = {
      priority: values.priority || 'Medium',
      status: values.status || 'To do',
      ...values,
    };
    if (editing) await updateItem('tasks', editing.id, payload);
    else await createItem('tasks', payload);
    setCreating(false);
    setEditing(null);
  }

  async function handleDelete(task: EntityDoc) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await deleteItem('tasks', task.id);
    if (detail?.id === task.id) setDetail(null);
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        count={items.length}
        action={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + New task
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} />
          <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-white p-0.5 sm:inline-flex">
            {(['board', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
                  view === v ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <FilterBar
          filters={filterDefs}
          values={filters}
          onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value }))}
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : view === 'board' ? (
        <BoardView
          tasks={filtered}
          onOpen={setDetail}
          onMove={(t, status) => updateItem('tasks', t.id, { status })}
        />
      ) : (
        <ListView tasks={filtered} onOpen={setDetail} onEdit={setEditing} onDelete={handleDelete} />
      )}

      {/* Create / edit */}
      <SidePanel
        open={creating || !!editing}
        title={editing ? 'Edit task' : 'New task'}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        <EntityForm
          fields={TASK_FIELDS}
          initial={editing}
          contacts={[]}
          submitLabel={editing ? 'Save changes' : 'Create task'}
          onSubmit={handleSubmit}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </SidePanel>

      {/* Detail */}
      <SidePanel open={!!liveDetail} title="Task details" onClose={() => setDetail(null)} wide>
        {liveDetail && (
          <EntityDetail
            config={TASK_CONFIG}
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

function BoardView({
  tasks,
  onOpen,
  onMove,
}: {
  tasks: EntityDoc[];
  onOpen: (t: EntityDoc) => void;
  onMove: (t: EntityDoc, status: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {TASK_STATUSES.map((status) => {
        const col = tasks.filter((t) => (t.status || 'To do') === status);
        return (
          <div key={status} className="min-w-0">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Pill value={status} />
              </div>
              <span className="text-xs text-slate-400">{col.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {col.map((t) => (
                <div key={t.id} className="card p-3 transition hover:shadow-md">
                  <button onClick={() => onOpen(t)} className="w-full text-left">
                    <p className="break-words text-sm font-medium text-slate-800">{t.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Pill value={t.priority} />
                      {t.owner && <span className="text-xs text-slate-500">{t.owner}</span>}
                    </div>
                    {t.dueDate && (
                      <p className="mt-1 text-xs text-slate-400">Due {formatDate(t.dueDate)}</p>
                    )}
                  </button>
                  <select
                    className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
                    value={status}
                    onChange={(e) => onMove(t, e.target.value)}
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        Move to: {s}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {col.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-300">
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  tasks,
  onOpen,
  onEdit,
  onDelete,
}: {
  tasks: EntityDoc[];
  onOpen: (t: EntityDoc) => void;
  onEdit: (t: EntityDoc) => void;
  onDelete: (t: EntityDoc) => void;
}) {
  if (tasks.length === 0) return <EmptyState title="No tasks" hint="Create your first task." />;
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((t) => (
        <div key={t.id} className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <button onClick={() => onOpen(t)} className="min-w-0 flex-1 text-left">
            <p className="break-words font-medium text-slate-800">{t.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {t.area && <span>{t.area}</span>}
              {t.owner && <span>· {t.owner}</span>}
              {t.dueDate && <span>· Due {formatDate(t.dueDate)}</span>}
            </div>
          </button>
          <div className="flex items-center gap-1.5 sm:shrink-0">
            <Pill value={t.priority} />
            <Pill value={t.status} />
            <CardMenu onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} />
          </div>
        </div>
      ))}
    </div>
  );
}
