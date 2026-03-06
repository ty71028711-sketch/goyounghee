'use client';

import { useState, useCallback, useEffect } from 'react';
import { Visit } from '@/types';

function sKey(uid: string) {
  return `session_visits_${uid}`;
}

export function useSessionVisits(uid: string | undefined) {
  const [visits, setVisits] = useState<Visit[]>([]);

  // 마운트 시 sessionStorage 에서 복원 (새로고침 대응)
  useEffect(() => {
    if (!uid) { setVisits([]); return; }
    try {
      const raw = sessionStorage.getItem(sKey(uid));
      setVisits(raw ? JSON.parse(raw) : []);
    } catch {
      setVisits([]);
    }
  }, [uid]);

  const add = useCallback((visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!uid) return;
    const newV: Visit = {
      ...visit,
      id:        `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setVisits(prev => {
      const next = [...prev, newV];
      sessionStorage.setItem(sKey(uid), JSON.stringify(next));
      return next;
    });
  }, [uid]);

  const update = useCallback((visit: Visit) => {
    if (!uid) return;
    setVisits(prev => {
      const next = prev.map(v => v.id === visit.id ? { ...visit, updatedAt: Date.now() } : v);
      sessionStorage.setItem(sKey(uid), JSON.stringify(next));
      return next;
    });
  }, [uid]);

  const remove = useCallback((visitId: string) => {
    if (!uid) return;
    // 알림 플래그 정리
    localStorage.removeItem(`notif_${visitId}`);
    [60, 30].forEach(m => sessionStorage.removeItem(`notif_fired_${visitId}_${m}`));

    setVisits(prev => {
      const next = prev.filter(v => v.id !== visitId);
      sessionStorage.setItem(sKey(uid), JSON.stringify(next));
      return next;
    });
  }, [uid]);

  // 보관함 저장 후 세션 초기화 (알림 플래그도 함께 정리)
  const clear = useCallback((currentVisits: Visit[]) => {
    if (!uid) return;
    currentVisits.forEach(v => {
      localStorage.removeItem(`notif_${v.id}`);
      [60, 30].forEach(m => sessionStorage.removeItem(`notif_fired_${v.id}_${m}`));
    });
    sessionStorage.removeItem(sKey(uid));
    setVisits([]);
  }, [uid]);

  return { visits, add, update, remove, clear };
}
