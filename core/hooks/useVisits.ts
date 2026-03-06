'use client';

import { useEffect, useState, useCallback } from 'react';
import { subscribeVisits, addVisit, updateVisit, deleteVisit } from '@/lib/firestore';
import { Visit } from '@/types';

export function useVisits(uid: string | undefined) {
  const [visits,  setVisits]  = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setVisits([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeVisits(uid, (items) => {
      setVisits(items);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const add = useCallback(async (visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!uid) return;
    await addVisit(uid, visit);
  }, [uid]);

  const update = useCallback(async (visit: Visit) => {
    if (!uid) return;
    await updateVisit(uid, visit);
  }, [uid]);

  const remove = useCallback(async (visitId: string) => {
    if (!uid) return;
    await deleteVisit(uid, visitId);
  }, [uid]);

  return { visits, loading, add, update, remove };
}
