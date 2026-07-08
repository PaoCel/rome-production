import { useRef, useState } from 'react';
import { useRelated } from '../hooks/useCollection';
import { deleteMedia, uploadMedia } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';
import MediaViewer, { isPdf } from './MediaViewer';
import type { EntityDoc, RelatedType } from '../types';

// Reusable media gallery with upload + delete + in-site preview.
export default function MediaGallery({
  relatedType,
  relatedId,
}: {
  relatedType: RelatedType;
  relatedId: string;
}) {
  const media = useRelated('media', relatedType, relatedId);
  const { displayName } = useAuth();
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<EntityDoc | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        await uploadMedia(file, relatedType, relatedId, displayName);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed. Check Storage rules and try again.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  // Image, video and PDF preview in-site; other docs open in a new tab.
  const canPreview = (m: EntityDoc) =>
    m.type === 'image' || m.type === 'video' || isPdf(m.fileName);

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Media</h4>
        <button
          className="btn-secondary py-1.5 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {media.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
          No media uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((m) => {
            const pdf = isPdf(m.fileName);
            const preview = canPreview(m);
            return (
              <div
                key={m.id}
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                {m.type === 'image' ? (
                  <button onClick={() => setViewing(m)} className="block w-full">
                    <img src={m.downloadUrl} alt={m.fileName} className="h-28 w-full object-cover" />
                  </button>
                ) : m.type === 'video' ? (
                  <button onClick={() => setViewing(m)} className="relative block w-full">
                    <video src={m.downloadUrl} className="h-28 w-full bg-black object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center text-3xl text-white/90">
                      ▶
                    </span>
                  </button>
                ) : pdf ? (
                  <button
                    onClick={() => setViewing(m)}
                    className="flex h-28 w-full flex-col items-center justify-center gap-1 bg-red-50 text-red-500"
                  >
                    <span className="text-2xl">📕</span>
                    <span className="px-2 text-center text-[11px] font-medium leading-tight">
                      View PDF
                    </span>
                  </button>
                ) : (
                  <a
                    href={m.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-28 w-full flex-col items-center justify-center gap-1 bg-slate-50 text-slate-500"
                  >
                    <span className="text-2xl">📄</span>
                    <span className="px-2 text-center text-[11px] leading-tight">Open document</span>
                  </a>
                )}

                <div className="flex items-center justify-between gap-1 px-2 py-1">
                  <button
                    className="min-w-0 flex-1 truncate text-left text-[11px] text-slate-500 hover:text-slate-700"
                    title={m.fileName}
                    onClick={() => (preview ? setViewing(m) : window.open(m.downloadUrl, '_blank'))}
                  >
                    {m.fileName}
                  </button>
                  <button
                    className="shrink-0 text-slate-300 hover:text-red-500"
                    onClick={() => deleteMedia(m.id, m.storagePath)}
                    aria-label="Delete media"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MediaViewer item={viewing} onClose={() => setViewing(null)} />
    </section>
  );
}
