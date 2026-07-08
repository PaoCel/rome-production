import { useEffect, useState } from 'react';
import { subscribe, where } from '../services/firestore';
import type { CollectionName, EntityDoc, RelatedType } from '../types';

// Realtime list of a whole collection.
export function useCollection(name: CollectionName) {
  const [items, setItems] = useState<EntityDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribe(name, (docs) => {
      setItems(docs);
      setLoading(false);
    });
    return unsub;
  }, [name]);

  return { items, loading };
}

// Realtime list filtered to a single related entity (media / comments).
export function useRelated(
  name: CollectionName,
  relatedType: RelatedType,
  relatedId: string | undefined,
) {
  const [items, setItems] = useState<EntityDoc[]>([]);

  useEffect(() => {
    if (!relatedId) {
      setItems([]);
      return;
    }
    const unsub = subscribe(name, setItems, [
      where('relatedType', '==', relatedType),
      where('relatedId', '==', relatedId),
    ]);
    return unsub;
  }, [name, relatedType, relatedId]);

  return items;
}
