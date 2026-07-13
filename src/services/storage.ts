import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, PROJECT_ID, storage } from '../config/firebase';
import { createItem, deleteItem, projectCol } from './firestore';
import type { EntityDoc, MediaType, RelatedType } from '../types';

const VIDEO_EXTENSIONS = /\.(mov|qt|mp4|m4v|webm|ogv|avi)$/i;

function detectType(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/') || VIDEO_EXTENSIONS.test(file.name)) return 'video';
  return 'document';
}

async function createVideoPoster(file: File): Promise<Blob | null> {
  if (detectType(file) !== 'video') return null;

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    let done = false;

    const finish = (poster: Blob | null) => {
      if (done) return;
      done = true;
      URL.revokeObjectURL(objectUrl);
      resolve(poster);
    };

    const capture = () => {
      if (!video.videoWidth || !video.videoHeight) {
        finish(null);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        finish(null);
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => finish(blob), 'image/jpeg', 0.82);
    };

    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.addEventListener('error', () => finish(null), { once: true });
    video.addEventListener(
      'loadedmetadata',
      () => {
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        if (duration > 0.2) {
          video.currentTime = Math.min(0.25, duration - 0.05);
        } else {
          capture();
        }
      },
      { once: true },
    );
    video.addEventListener('seeked', capture, { once: true });
    video.src = objectUrl;
    video.load();

    window.setTimeout(() => finish(null), 8000);
  });
}

// Upload a file to Storage and create a matching media document in Firestore.
export async function uploadMedia(
  file: File,
  relatedType: RelatedType,
  relatedId: string,
  uploadedBy: string,
) {
  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const storagePath = `projects/${PROJECT_ID}/${relatedType}/${relatedId}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, storagePath);
  const type = detectType(file);
  const isQuickTime = type === 'video' && /\.(mov|qt)$/i.test(file.name);
  const contentType = isQuickTime && (!file.type || file.type === 'application/octet-stream')
    ? 'video/quicktime'
    : file.type || undefined;

  await uploadBytes(storageRef, file, contentType ? { contentType } : undefined);
  const downloadUrl = await getDownloadURL(storageRef);

  const posterBlob = type === 'video' ? await createVideoPoster(file) : null;
  const nextPosterStoragePath = posterBlob ? `${storagePath}.poster.jpg` : undefined;
  let posterStoragePath: string | undefined;
  let posterUrl: string | undefined;

  if (posterBlob && nextPosterStoragePath) {
    try {
      const posterRef = ref(storage, nextPosterStoragePath);
      await uploadBytes(posterRef, posterBlob, { contentType: 'image/jpeg' });
      posterUrl = await getDownloadURL(posterRef);
      posterStoragePath = nextPosterStoragePath;
    } catch (err) {
      console.warn('uploadMedia poster', err);
    }
  }

  await createItem('media', {
    fileName: file.name,
    storagePath,
    downloadUrl,
    type,
    posterStoragePath,
    posterUrl,
    relatedType,
    relatedId,
    uploadedBy,
  });
}

// Keep exactly one explicitly selected image per gallery. Older galleries with
// no selection continue to fall back to their first uploaded photo.
export async function setMediaThumbnail(media: EntityDoc[], mediaId: string) {
  const target = media.find((item) => item.id === mediaId);
  if (!target || target.type !== 'image') return;

  const batch = writeBatch(db);
  media.forEach((item) => {
    const shouldBeThumbnail = item.id === mediaId;
    if (Boolean(item.isThumbnail) === shouldBeThumbnail) return;
    batch.update(doc(projectCol('media'), item.id), {
      isThumbnail: shouldBeThumbnail,
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

// Remove a media file from Storage and its Firestore record.
export async function deleteMedia(
  mediaId: string,
  storagePath: string,
  posterStoragePath?: string,
) {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    // File may already be gone — still remove the record.
    console.warn('deleteMedia storage', err);
  }
  if (posterStoragePath) {
    try {
      await deleteObject(ref(storage, posterStoragePath));
    } catch (err) {
      console.warn('deleteMedia poster', err);
    }
  }
  await deleteItem('media', mediaId);
}
