import { useRef, useState } from 'react';
import { useRelated } from '../hooks/useCollection';
import { deleteMedia, uploadMedia } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';
import MediaViewer, { isPdf } from './MediaViewer';
import AppIcon from './icons/AppIcon';
import type { EntityDoc, RelatedType } from '../types';
import { sortMediaByUpload } from '../utils/media';

const videoPreviewSrc = (url: string) => `${url}#t=0.1`;

// Reusable media gallery with upload + delete + in-site preview.
export default function MediaGallery({
  relatedType,
  relatedId,
  hero = false,
  profileGrid = false,
  readOnly = false,
}: {
  relatedType: RelatedType;
  relatedId: string;
  hero?: boolean; // show the first image as a large cover above the grid
  profileGrid?: boolean; // social profile layout: upload tile + uniform media grid
  readOnly?: boolean;
}) {
  const media = useRelated('media', relatedType, relatedId);
  const { displayName } = useAuth();
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<EntityDoc | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sortedMedia = sortMediaByUpload(media);

  // Hero cover: prefer a photo, fall back to a video.
  const heroMedia = hero && !profileGrid
    ? sortedMedia.find((m) => m.type === 'image') || sortedMedia.find((m) => m.type === 'video')
    : undefined;
  const gridMedia = heroMedia
    ? sortedMedia.filter((m) => m.id !== heroMedia.id)
    : sortedMedia;

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
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-slate-700">Media</h4>
        {!readOnly && !profileGrid && (
          <>
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
          </>
        )}
      </div>

      {profileGrid && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {!readOnly && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="group flex aspect-square min-h-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-600 disabled:cursor-wait disabled:opacity-60"
              aria-label="Upload more photos or files"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-3xl font-light leading-none transition group-hover:bg-brand-100">
                +
              </span>
              <span className="px-2 text-center text-xs font-semibold">
                {busy ? 'Uploading…' : 'Add media'}
              </span>
            </button>
          )}

          {sortedMedia.map((m) => {
            const pdf = isPdf(m.fileName);
            const preview = canPreview(m);
            return (
              <div
                key={m.id}
                className="group relative aspect-square min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                title={m.fileName}
              >
                {m.type === 'image' ? (
                  <button onClick={() => setViewing(m)} className="block h-full w-full bg-slate-100">
                    <img
                      src={m.downloadUrl}
                      alt={m.fileName}
                      className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.02]"
                    />
                  </button>
                ) : m.type === 'video' ? (
                  <button onClick={() => setViewing(m)} className="relative block h-full w-full bg-black">
                    <video
                      src={videoPreviewSrc(m.downloadUrl)}
                      poster={m.posterUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-contain"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white/90">
                      <AppIcon name="play" className="h-11 w-11 drop-shadow" />
                    </span>
                  </button>
                ) : pdf ? (
                  <button
                    onClick={() => setViewing(m)}
                    className="flex h-full w-full flex-col items-center justify-center gap-2 bg-red-50 p-3 text-red-500"
                  >
                    <AppIcon name="pdf" className="h-14 w-14" />
                    <span className="max-w-full truncate text-xs font-medium">{m.fileName}</span>
                  </button>
                ) : (
                  <a
                    href={m.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 p-3 text-slate-500"
                  >
                    <AppIcon name="document" className="h-14 w-14" />
                    <span className="max-w-full truncate text-xs">{m.fileName}</span>
                  </a>
                )}

                {!readOnly && (
                  <button
                    type="button"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/65 text-white opacity-100 shadow-sm transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={() => deleteMedia(m.id, m.storagePath, m.posterStoragePath)}
                    aria-label={`Delete ${m.fileName}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                )}

                {preview && (
                  <span className="pointer-events-none absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-slate-900/55 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 backdrop-blur-sm transition sm:group-hover:opacity-100">
                    {m.fileName}
                  </span>
                )}
              </div>
            );
          })}

          {sortedMedia.length === 0 && readOnly && (
            <p className="col-span-full rounded-xl border border-dashed border-slate-300 px-3 py-8 text-center text-xs text-slate-400">
              No media uploaded yet.
            </p>
          )}

          {!readOnly && (
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          )}
        </div>
      )}

      {/* Large cover (hero mode) */}
      {heroMedia && (
        <button
          onClick={() => setViewing(heroMedia)}
          className="relative mb-3 block w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
        >
          {heroMedia.type === 'video' ? (
            <>
              <video
                src={videoPreviewSrc(heroMedia.downloadUrl)}
                poster={heroMedia.posterUrl}
                muted
                playsInline
                preload="metadata"
                className="aspect-[16/9] w-full bg-black object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center text-white/90">
                <AppIcon name="play" className="h-14 w-14 drop-shadow" />
              </span>
            </>
          ) : (
            <img
              src={heroMedia.downloadUrl}
              alt={heroMedia.fileName}
              className="aspect-[16/9] w-full object-cover transition hover:scale-[1.02]"
            />
          )}
        </button>
      )}

      {!profileGrid && (media.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
          No media uploaded yet.
        </p>
      ) : gridMedia.length === 0 ? null : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gridMedia.map((m) => {
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
                    <video
                      src={videoPreviewSrc(m.downloadUrl)}
                      poster={m.posterUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-28 w-full bg-black object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white/90">
                      <AppIcon name="play" className="h-9 w-9 drop-shadow" />
                    </span>
                  </button>
                ) : pdf ? (
                  <button
                    onClick={() => setViewing(m)}
                    className="flex h-28 w-full flex-col items-center justify-center gap-1 bg-red-50 text-red-500"
                  >
                    <AppIcon name="pdf" className="h-12 w-12" />
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
                    <AppIcon name="document" className="h-12 w-12" />
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
                  {!readOnly && (
                    <button
                      className="shrink-0 text-slate-300 hover:text-red-500"
                      onClick={() => deleteMedia(m.id, m.storagePath, m.posterStoragePath)}
                      aria-label="Delete media"
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <MediaViewer item={viewing} onClose={() => setViewing(null)} />
    </section>
  );
}
