'use client';

import { useEffect, useState, useCallback } from 'react';
import { subscribeArchives, saveArchive, deleteArchive } from '@/lib/firestore';
import { Archive, Visit } from '@/types';

export function useArchives(uid: string | undefined) {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!uid) { setArchives([]); return; }
    const unsub = subscribeArchives(uid, setArchives);
    return unsub;
  }, [uid]);

  const save = useCallback(async (visits: Visit[]): Promise<boolean> => {
    if (!uid || visits.length === 0) return false;
    setSaving(true);
    try {
      await saveArchive(uid, visits);
      return true;
    } catch (e) {
      console.error('archive save error', e);
      return false;
    } finally {
      setSaving(false);
    }
  }, [uid]);

  const remove = useCallback(async (archiveId: string) => {
    if (!uid) return;
    await deleteArchive(uid, archiveId);
  }, [uid]);

  return { archives, saving, save, remove };
}
