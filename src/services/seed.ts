import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, PROJECT_ID } from '../config/firebase';
import seedData from '../data/rejoiceSeed.json';

// The Rejoice dataset extracted from the Excel tracker. Keyed by collection name;
// each record carries an `_id` (the original Excel ID) used as the Firestore doc id
// so imports are idempotent and requirement→option links (requirementId) stay valid.
type SeedRecord = { _id: string; [key: string]: unknown };
const DATA = seedData as unknown as Record<string, SeedRecord[]>;

const BATCH_LIMIT = 400; // Firestore hard limit is 500 writes per batch.

// Total number of documents in the dataset (for UI copy).
export const REJOICE_DOC_COUNT = Object.values(DATA).reduce((n, docs) => n + docs.length, 0);

// Write every Rejoice document into Firestore. Overwrites by id (idempotent).
export async function importRejoiceData(): Promise<number> {
  let batch = writeBatch(db);
  let pending = 0;
  let total = 0;
  for (const [collection, docs] of Object.entries(DATA)) {
    for (const record of docs) {
      const { _id, ...fields } = record;
      const ref = doc(db, 'projects', PROJECT_ID, collection, _id);
      batch.set(ref, {
        ...fields,
        importedFromExcel: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      total += 1;
      if (++pending >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        pending = 0;
      }
    }
  }
  if (pending > 0) await batch.commit();
  return total;
}

// Delete every document that the import created (matched by its known id).
// Manually-added items keep their own ids and are left untouched.
export async function clearRejoiceData(): Promise<number> {
  let batch = writeBatch(db);
  let pending = 0;
  let total = 0;
  for (const [collection, docs] of Object.entries(DATA)) {
    for (const record of docs) {
      const ref = doc(db, 'projects', PROJECT_ID, collection, record._id);
      batch.delete(ref);
      total += 1;
      if (++pending >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        pending = 0;
      }
    }
  }
  if (pending > 0) await batch.commit();
  return total;
}
