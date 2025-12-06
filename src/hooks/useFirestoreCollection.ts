import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  queryEqual
} from 'firebase/firestore';

interface UseFirestoreCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useFirestoreCollection<T extends DocumentData>(
  query: Query | null
): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const prevQueryRef = useRef<Query | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    // 이전 쿼리와 동일하면 재구독하지 않음
    if (prevQueryRef.current && queryEqual(prevQueryRef.current, query)) {
      return;
    }
    prevQueryRef.current = query;

    setLoading(true);

    try {
      const unsubscribe = onSnapshot(
        query,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          setData(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Firestore collection error:`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [query]);

  return { data, loading, error };
}
