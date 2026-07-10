import { useEffect } from 'react';
import type { EntityDoc } from '../types';
import AppIcon from './icons/AppIcon';

export function isPdf(fileName = ''): boolean {
  return /\.pdf$/i.test(fileName);
}

// Full-screen in-site viewer for a single media item.
// Images, videos and PDFs render inline; other documents fall back to a link.
export default function MediaViewer({
  item,
  onClose,
}: {
  item: EntityDoc | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;

  const pdf = isPdf(item.fileName);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm">
      <div className="flex flex-col gap-2 px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="truncate text-sm font-medium" title={item.fileName}>
          {item.fileName}
        </span>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:items-center">
          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25"
          >
            Open in new tab
          </a>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25"
          >
            Close
            <AppIcon name="close" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        className="flex flex-1 items-center justify-center overflow-auto p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {item.type === 'image' ? (
          <img
            src={item.downloadUrl}
            alt={item.fileName}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        ) : item.type === 'video' ? (
          <video
            src={item.downloadUrl}
            poster={item.posterUrl}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-lg"
          />
        ) : pdf ? (
          <iframe
            src={item.downloadUrl}
            title={item.fileName}
            className="h-full w-full max-w-4xl rounded-lg bg-white shadow-2xl"
          />
        ) : (
          <div className="rounded-xl bg-white p-8 text-center">
            <AppIcon name="document" className="mx-auto mb-2 h-16 w-16" />
            <p className="mb-3 text-sm text-slate-600">This file type can't be previewed in the browser.</p>
            <a
              href={item.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              Download / open
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
