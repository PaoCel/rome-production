import { deleteItem, findWhere, updateItem, where } from './firestore';
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
  await Promise.all(media.map((m) => deleteMedia(m.id, m.storagePath, m.posterStoragePath)));

  const comments = await findWhere(
    'comments',
    where('relatedType', '==', relatedType),
    where('relatedId', '==', relatedId),
  );
  await Promise.all(comments.map((c) => deleteItem('comments', c.id)));
}

// Delete budget items derived from a flat entity (matched on sourceId).
async function deleteBudgetItemsBySource(sourceId: string, sourceType: string) {
  const rows = await findWhere(
    'budgetItems',
    where('sourceType', '==', sourceType),
    where('sourceId', '==', sourceId),
  );
  await Promise.all(rows.map((r) => deleteItem('budgetItems', r.id)));
}

// Delete the budget item committed from a specific option. Option budget lines
// are keyed on the requirement (sourceId), so match on sourceOptionId instead.
async function deleteBudgetItemsByOption(optionId: string, sourceType: string) {
  const rows = await findWhere(
    'budgetItems',
    where('sourceType', '==', sourceType),
    where('sourceOptionId', '==', optionId),
  );
  await Promise.all(rows.map((r) => deleteItem('budgetItems', r.id)));
}

// Delete a single option: its media/comments, any budget line, then the doc.
export async function deleteOptionCascade(optionConfig: EntityConfig, option: EntityDoc) {
  if (optionConfig.relatedType) {
    await deleteMediaAndComments(optionConfig.relatedType, option.id);
  }
  if (optionConfig.collection === 'castingOptions') {
    const votes = await findWhere('castingVotes', where('optionId', '==', option.id));
    await Promise.all(votes.map((vote) => deleteItem('castingVotes', vote.id)));
  }
  if (optionConfig.budgetSource) {
    await deleteBudgetItemsByOption(option.id, optionConfig.budgetSource);
  }
  await deleteItem(optionConfig.collection, option.id);
}

// Delete any entity and everything attached to it.
export async function deleteEntityCascade(config: EntityConfig, item: EntityDoc) {
  // Two-tier requirement → delete (or detach, for multi-linked options) its options first.
  if (config.optionConfig) {
    const oc = config.optionConfig;
    const linkField = oc.requirementLinkField || 'requirementId';
    const options = oc.multiRequirement
      ? await findWhere(oc.collection, where(linkField, 'array-contains', item.id))
      : await findWhere(oc.collection, where(linkField, '==', item.id));
    await Promise.all(
      options.map((o) => {
        if (oc.multiRequirement) {
          const remaining = ((o[linkField] as string[]) || []).filter((id) => id !== item.id);
          // Still linked to other requirements — detach this one instead of deleting the profile.
          if (remaining.length > 0) return updateItem(oc.collection, o.id, { [linkField]: remaining });
        }
        return deleteOptionCascade(oc, o);
      }),
    );
  }
  // Flat entity that can be committed to budget (e.g. production option).
  if (config.budgetSource) await deleteBudgetItemsBySource(item.id, config.budgetSource);
  if (config.relatedType) await deleteMediaAndComments(config.relatedType, item.id);
  await deleteItem(config.collection, item.id);
}
