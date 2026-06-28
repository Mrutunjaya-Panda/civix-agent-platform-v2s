import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../lib/schema';

export function useActivityFeed(limitCount = 50) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.ACTIVITY_FEED),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeed(feedData);
      setLoading(false);
    }, (err) => {
      console.error('[useActivityFeed] Error fetching feed:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [limitCount]);

  return { feed, loading };
}
