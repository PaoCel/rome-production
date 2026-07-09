import { useEffect, type ReactNode } from 'react';

// Mobile-first create/edit surface: bottom sheet on phones, side drawer on larger screens.
export default function BottomSheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-x-0 bottom-0 flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-slate-50 shadow-panel sm:inset-y-0 sm:left-auto sm:right-0 sm:h-dvh sm:max-h-none sm:w-[26rem] sm:rounded-none"
      >
        <div className="mx-auto mb-1 mt-2 h-1.5 w-10 shrink-0 rounded-full bg-slate-300 sm:hidden" />

        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="min-w-0 truncate font-display text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
