import type { EntityDoc } from '../types';
import { toMillis } from './format';

export function sortMediaByUpload(media: EntityDoc[]) {
  return [...media].sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
}

export function firstUploadedPhoto(media: EntityDoc[]) {
  const sorted = sortMediaByUpload(media);
  return sorted.find((item) => item.type === 'image' && item.isThumbnail)
    || sorted.find((item) => item.type === 'image');
}

export function preferredThumbnail(media: EntityDoc[]) {
  const sorted = sortMediaByUpload(media);
  return sorted.find((item) => item.type === 'image' && item.isThumbnail)
    || sorted.find((item) => item.type === 'image')
    || sorted.find((item) => item.type === 'video');
}
