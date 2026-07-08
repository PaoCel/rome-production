import { useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { createItem } from '../services/firestore';
import Pill from './ui/Pill';
import type { RelatedType } from '../types';

// Shows tasks linked to an entity and lets you add one quickly.
export default function RelatedTasks({
  relatedType,
  relatedId,
  contextTitle,
}: {
  relatedType: RelatedType;
  relatedId: string;
  contextTitle: string;
}) {
  const { items } = useCollection('tasks');
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const related = items.filter(
    (t) => t.relatedType === relatedType && t.relatedId === relatedId,
  );

  async function add() {
    const value = title.trim();
    if (!value) return;
    setAdding(true);
    try {
      await createItem('tasks', {
        title: value,
        description: '',
        area: contextTitle,
        owner: '',
        priority: 'Medium',
        status: 'To do',
        relatedType,
        relatedId,
      });
      setTitle('');
    } finally {
      setAdding(false);
    }
  }

  return (
    <section>
      <h4 className="mb-2 text-sm font-semibold text-slate-700">
        Related tasks {related.length > 0 && <span className="text-slate-400">({related.length})</span>}
      </h4>

      <div className="space-y-1.5">
        {related.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <span className="break-words text-sm text-slate-700">{t.title}</span>
            <div className="flex shrink-0 items-center gap-1.5">
              <Pill value={t.priority} />
              <Pill value={t.status} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <input
          className="input"
          placeholder="Add a task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn-secondary" onClick={add} disabled={adding || !title.trim()}>
          Add
        </button>
      </div>
    </section>
  );
}
