'use client';

import { useEffect, useState, useCallback } from 'react';
import { getBusinessCard, saveBusinessCard } from '@/lib/firestore';
import { BusinessCard } from '@/types';

const DEFAULT_CARD: BusinessCard = {
  officeName: '', managerName: '', phone: '', address: '', blog: 'sojangnote.com',
};

export function useBusinessCard(uid: string | undefined) {
  const [card,   setCard]   = useState<BusinessCard>(DEFAULT_CARD);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid) return;
    getBusinessCard(uid).then(c => { if (c) setCard(c); });
  }, [uid]);

  const save = useCallback(async (newCard: BusinessCard) => {
    if (!uid) return;
    setSaving(true);
    await saveBusinessCard(uid, newCard);
    setCard(newCard);
    setSaving(false);
  }, [uid]);

  return { card, setCard, save, saving };
}
