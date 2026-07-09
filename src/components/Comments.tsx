import { useState } from 'react';
import { useRelated } from '../hooks/useCollection';
import { createItem, deleteItem } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/format';
import { toMillis } from '../utils/format';
import type { RelatedType } from '../types';

// Reusable comment thread for any entity.
export default function Comments({
  relatedType,
  relatedId,
}: {
  relatedType: RelatedType;
  relatedId: string;
}) {
  const comments = useRelated('comments', relatedType, relatedId);
  const { displayName } = useAuth();
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const sorted = [...comments].sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));

  async function post() {
    const value = text.trim();
    if (!value) return;
    setPosting(true);
    try {
      await createItem('comments', {
        relatedType,
        relatedId,
        text: value,
        authorName: displayName,
      });
      setText('');
    } finally {
      setPosting(false);
    }
  }

  return (
    <section>
      <h4 className="mb-2 text-sm font-semibold text-ink">
        Comments {comments.length > 0 && <span className="text-faint">({comments.length})</span>}
      </h4>

      <div className="space-y-2">
        {sorted.map((c) => (
          <div key={c.id} className="group rounded-lg border border-line bg-surface px-3 py-2">
            <div className="mb-0.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink">{c.authorName}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-faint">{formatDate(c.createdAt)}</span>
                <button
                  className="text-faint transition hover:text-red-500 sm:text-faint sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={() => deleteItem('comments', c.id)}
                  aria-label="Delete comment"
                >
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                    <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
              {c.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
        <textarea
          className="input min-h-[42px] resize-y"
          placeholder="Write a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn-primary w-full sm:w-auto" onClick={post} disabled={posting || !text.trim()}>
          Post
        </button>
      </div>
    </section>
  );
}
