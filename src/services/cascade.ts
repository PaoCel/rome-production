import { deleteItem, findWhere, where } from './firestore';
import { deleteMedia } from './storage';
import type { EntityConfig } from '../data/entities';
import type { EntityDoc } from '../types';

// Firestore has no cascade delete. These helpers remove everything that hangs
// off an entity so deleting it never leaves orphaned options, media, comments
// or budget items behind.

// Delete media (including the Storage files) and comments for a related entity.
async function deleteMediaAndComments(relatedType: string, relatedId: string) {
  const media = await findWhere(
    'media',
    where('relatedType', '==', relatedType),
    where('relatedId', '==', relatedId),
  );
  await Promise.all(media.map((m) => deleteMedia(m.id, m.storagePath)));

  const comments = await findWhere(
    'comments',
    where('relatedType', '==', relatedType),
    where('relatedId', '==', relatedId),
  );
  await Promise.all(comments.map((c) => deleteItem('comments', c.id)));
}

// Delete budget items derived from a flat entity (matched on sourceId).
async function deleteBudgetItemsBySource(sourceId: string) {
  const rows = await findWhere('budgetItems', where('sourceId', '==', sourceId));
  await Promise.all(rows.map((r) => deleteItem('budgetItems', r.id)));
}

// Delete the budget item committed from a specific option. Option budget lines
// are keyed on the requirement (sourceId), so match on sourceOptionId instead.
async function deleteBudgetItemsByOption(optionId: string) {
  const rows = await findWhere('budgetItems', where('sourceOptionId', '==', optionId));
  await Promise.all(rows.map((r) => deleteItem('budgetItems', r.id)));
}

// Delete a single option: its media/comments, any budget line, then the doc.
export async function deleteOptionCascade(optionConfig: EntityConfig, option: EntityDoc) {
  if (optionConfig.relatedType) {
    await deleteMediaAndComments(optionConfig.relatedType, option.id);
  }
  await deleteBudgetItemsByOption(option.id);
  await deleteItem(optionConfig.collection, option.id);
}

// Delete any entity and everything attached to it.
export async function deleteEntityCascade(config: EntityConfig, item: EntityDoc) {
  // Two-tier requirement → delete all of its options first.
  if (config.optionConfig) {
    const oc = config.optionConfig;
    const linkField = oc.requirementLinkField || 'requirementId';
    const options = await findWhere(oc.collection, where(linkField, '==', item.id));
    await Promise.all(options.map((o) => deleteOptionCascade(oc, o)));
  }
  // Flat entity that can be committed to budget (e.g. production option).
  if (config.budgetSource) await deleteBudgetItemsBySource(item.id);
  if (config.relatedType) await deleteMediaAndComments(config.relatedType, item.id);
  await deleteItem(config.collection, item.id);
}
