import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { WatchlistItem, Title, Rating } from '../types';

export function useWatchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [titles, setTitles] = useState<Record<number, Title>>({});
  const [ratings, setRatings] = useState<Record<number, Rating>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'watchlistItems'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WatchlistItem));
      setItems(newItems);
      
      const missingIds = newItems.map(i => i.tmdbId).filter(id => !titles[id]);
      if (missingIds.length > 0) {
         const fetchedTitles: Record<number, Title> = {};
         await Promise.all(missingIds.map(async id => {
            const titleDoc = await getDoc(doc(db, 'titles', id.toString()));
            if (titleDoc.exists()) {
               fetchedTitles[id] = titleDoc.data() as Title;
            }
         }));
         setTitles(prev => ({ ...prev, ...fetchedTitles }));
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'ratings'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newRatings: Record<number, Rating> = {};
      snapshot.docs.forEach(d => {
        const r = { id: d.id, ...d.data() } as Rating;
        newRatings[r.tmdbId] = r;
      });
      setRatings(newRatings);
    });
    return unsubscribe;
  }, [user]);

  const addTitleToCache = useCallback(async (title: Title) => {
    await setDoc(doc(db, 'titles', title.tmdbId.toString()), title, { merge: true });
  }, []);

  const addToWatchlist = useCallback(async (title: Title) => {
    if (!user) return;
    await addTitleToCache(title);
    
    // Check if already in list
    const existing = items.find(i => i.tmdbId === title.tmdbId);
    if (existing) return;

    const newItem: Omit<WatchlistItem, 'id'> = {
      userId: user.uid,
      tmdbId: title.tmdbId,
      status: 'to-watch',
      addedAt: Date.now(),
      addedBy: user.uid
    };
    await setDoc(doc(db, 'watchlistItems', `${user.uid}_${title.tmdbId}`), newItem);
  }, [user, addTitleToCache, items]);

  const updateStatus = useCallback(async (tmdbId: number, status: 'to-watch' | 'watched') => {
    if (!user) return;
    await updateDoc(doc(db, 'watchlistItems', `${user.uid}_${tmdbId}`), { status });
  }, [user]);

  const removeTitle = useCallback(async (tmdbId: number) => {
    if (!user) return;
    await deleteDoc(doc(db, 'watchlistItems', `${user.uid}_${tmdbId}`));
    await deleteDoc(doc(db, 'ratings', `${user.uid}_${tmdbId}`));
  }, [user]);

  const rateTitle = useCallback(async (tmdbId: number, rating: number, note?: string) => {
    if (!user) return;
    const newRating: Omit<Rating, 'id'> = {
      userId: user.uid,
      tmdbId,
      rating,
      note,
      ratedAt: Date.now()
    };
    await setDoc(doc(db, 'ratings', `${user.uid}_${tmdbId}`), newRating, { merge: true });
  }, [user]);

  return { items, titles, ratings, loading, addToWatchlist, updateStatus, removeTitle, rateTitle };
}
