import { useEffect, useRef, useState } from 'react';

// Small accessible kebab (3-dots) menu with Edit / Delete actions.
export default function CardMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="rounded-lg p-1.5 text-faint hover:bg-surface-2 hover:text-muted"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-32 rounded-xl border border-line bg-surface py-1 shadow-card-hover">
          <button
            type="button"
            className="w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-surface-2"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/15"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
