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

  await createItem('media', {
    fileName: file.name,
    storagePath,
    downloadUrl,
    type: detectType(file),
    relatedType,
    relatedId,
    uploadedBy,
  });
}

// Remove a media file from Storage and its Firestore record.
export async function deleteMedia(mediaId: string, storagePath: string) {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    // File may already be gone — still remove the record.
    console.warn('deleteMedia storage', err);
  }
  await deleteItem('media', mediaId);
}
