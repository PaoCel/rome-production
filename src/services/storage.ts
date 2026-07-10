import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { PROJECT_ID, storage } from '../config/firebase';
import { createItem, deleteItem } from './firestore';
import type { MediaType, RelatedType } from '../types';

function detectType(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'document';
}

async function createVideoPoster(file: File): Promise<Blob | null> {
  if (!file.type.startsWith('video/')) return null;

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

  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  const type = detectType(file);

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
