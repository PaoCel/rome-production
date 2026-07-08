import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, PROJECT_ID } from '../config/firebase';
import type { CollectionName, EntityDoc } from '../types';

// All collections live under a single project document for the MVP.
export const projectCol = (name: CollectionName) =>
  collection(db, 'projects', PROJECT_ID, name);

const projectDoc = (name: CollectionName, id: string) =>
  doc(db, 'projects', PROJECT_ID, name, id);

// Realtime subscription. Returns an unsubscribe function.
export function subscribe(
  name: CollectionName,
  cb: (items: EntityDoc[]) => void,
  constraints: QueryConstraint[] = [],
): () => void {
  const q = query(projectCol(name), ...constraints);
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.error(`subscribe(${name})`, err);
      cb([]);
    },
  );
}

export async function createItem(name: CollectionName, data: Record<string, any>) {
  const ref = await addDoc(projectCol(name), {
    ...clean(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateItem(
  name: CollectionName,
  id: string,
  data: Record<string, any>,
) {
  await updateDoc(projectDoc(name, id), {
    ...clean(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItem(name: CollectionName, id: string) {
  await deleteDoc(projectDoc(name, id));
}

// One-off fetch with constraints (used by the budget de-dup logic).
export async function findWhere(
  name: CollectionName,
  ...constraints: QueryConstraint[]
): Promise<EntityDoc[]> {
  const snap = await getDocs(query(projectCol(name), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export { where, orderBy };

// Strip undefined values — Firestore rejects them.
function clean(data: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}
