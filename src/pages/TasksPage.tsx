import { useMemo, useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { createItem, deleteItem, updateItem } from '../services/firestore';
import { TASK_PRIORITIES, TASK_STATUSES } from '../data/constants';
import { OWNERS } from '../data/owners';
import type { EntityConfig } from '../data/entities';
import type { EntityDoc, FieldConfig } from '../types';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import FilterControl from '../components/ui/FilterControl';
import EmptyState from '../components/ui/EmptyState';
import SidePanel from '../components/ui/SidePanel';
import BottomSheet from '../components/ui/BottomSheet';
import EntityForm from '../components/form/EntityForm';
import EntityDetail from '../components/EntityDetail';
import CardMenu from '../components/ui/CardMenu';
import Fab from '../components/ui/Fab';
import { formatDate } from '../utils/format';

const PRIORITY_DOT: Record<string, string> = {
  High: 'bg-rose-500',
  Medium: 'bg-amber-500',
  Low: 'bg-blue-500',
};

const STATUS_LANE_CLASS: Record<string, string> = {
  'To do': 'bg-surface-2 text-muted',
  'In progress': 'bg-blue-100 text-blue-700',
  Waiting: 'bg-amber-100 text-amber-700',
  Blocked: 'bg-rose-100 text-rose-700',
  Done: 'bg-emerald-100 text-emerald-700',
};

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
      <Fab onClick={() => setCreating(true)} label="New task" />
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
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} />
          <FilterControl
            filters={filterDefs}
            values={filters}
            onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value }))}
            onClear={() => setFilters({})}
          />
        </div>
        <div className="grid grid-cols-2 rounded-lg border border-line bg-surface p-0.5 sm:inline-flex">
          {(['board', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
                view === v ? 'bg-brand-600 text-white' : 'text-muted hover:bg-surface-2'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-faint">Loading…</p>
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
      <BottomSheet
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
      </BottomSheet>

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
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-5 lg:items-start lg:gap-3">
      {TASK_STATUSES.map((status) => {
        const col = tasks.filter((t) => (t.status || 'To do') === status);
        return (
          <div key={status} className="min-w-0">
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                STATUS_LANE_CLASS[status] || 'bg-surface-2 text-muted'
              }`}
            >
              <span aria-hidden="true" className="text-xs tracking-tighter opacity-60">|||</span>
              <span>{status}</span>
              <span className="ml-auto text-xs font-medium opacity-70">{col.length}</span>
            </div>
            <div className="ml-1.5 mt-2 flex flex-col gap-2 border-l-2 border-line pl-1.5 lg:ml-0 lg:border-l-0 lg:pl-0">
              {col.map((t) => (
                <div key={t.id} className="card p-3 transition hover:shadow-md">
                  <button onClick={() => onOpen(t)} className="w-full text-left">
                    <p className="break-words text-sm font-medium text-ink">{t.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[t.priority] || 'bg-slate-300'}`}
                        aria-hidden="true"
                      />
                      {t.owner && <span>{t.owner}</span>}
                      {t.dueDate && <span>Due {formatDate(t.dueDate)}</span>}
                    </div>
                  </button>
                  <select
                    className="mt-2 w-full rounded-md border border-line bg-surface-2 px-2 py-1 text-xs text-muted"
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
                <div className="rounded-lg border border-dashed border-line py-6 text-center text-xs text-faint">
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
    <div>
      <div className="mb-2 flex items-center justify-between px-1 text-xs text-faint">
        <span>{tasks.length} task{tasks.length === 1 ? '' : 's'}</span>
        <span>Ordina: scadenza</span>
      </div>
      <div className="card divide-y divide-line">
      {tasks.map((t) => (
        <div
          key={t.id}
          className="flex cursor-pointer items-center gap-3 p-3 hover:bg-surface-2"
          onClick={() => onOpen(t)}
        >
          <span
            className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 ${
              t.status === 'Done' ? 'border-emerald-500 bg-emerald-500' : 'border-line bg-surface'
            }`}
            aria-hidden="true"
          >
            {t.status === 'Done' && (
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`break-words text-sm font-medium ${t.status === 'Done' ? 'text-faint line-through' : 'text-ink'}`}>
              {t.title}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-faint">
              {t.area && <span>{t.area}</span>}
              {t.owner && <span>- {t.owner}</span>}
              {t.dueDate && <span>- Due {formatDate(t.dueDate)}</span>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-xs text-faint sm:inline">{t.status || 'To do'}</span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${PRIORITY_DOT[t.priority] || 'bg-slate-300'}`}
              aria-hidden="true"
              title={t.priority}
            />
            <div onClick={(e) => e.stopPropagation()}>
              <CardMenu onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} />
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
