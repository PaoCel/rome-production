import type { EntityDoc } from '../types';
import { toMillis } from './format';

export function sortMediaByUpload(media: EntityDoc[]) {
  return [...media].sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
}

export function firstUploadedPhoto(media: EntityDoc[]) {
  return sortMediaByUpload(media).find((item) => item.type === 'image');
}
