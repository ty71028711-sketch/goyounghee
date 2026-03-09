import {
  doc, getDoc, setDoc, deleteDoc,
  collection, onSnapshot, addDoc,
  query, orderBy, Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/firebase';
import { Visit, Archive, BusinessCard } from '@/types';

/* ── 매물 ─────────────────────────────────── */
function visitsCol(uid: string) {
  return collection(db, 'visits', uid, 'items');
}

export function subscribeVisits(uid: string, cb: (visits: Visit[]) => void): Unsubscribe {
  const q = query(visitsCol(uid), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Visit));
  });
}

export async function addVisit(uid: string, visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(visitsCol(uid), {
    ...visit,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateVisit(uid: string, visit: Visit): Promise<void> {
  const { id, ...data } = visit;
  await setDoc(doc(visitsCol(uid), id), { ...data, updatedAt: Date.now() });
}

export async function deleteVisit(uid: string, visitId: string): Promise<void> {
  await deleteDoc(doc(visitsCol(uid), visitId));
}

/* ── 보관함 ─────────────────────────────────── */
function archivesCol(uid: string) {
  return collection(db, 'archives', uid, 'saves');
}

export async function saveArchive(uid: string, visits: Visit[], customerName?: string, customerPhone?: string): Promise<string> {
  const now = new Date();
  const visitDate = now.toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' });
  const ref = await addDoc(archivesCol(uid), {
    savedAt:       now.getTime(),
    visitDate,
    visitCount:    visits.length,
    visits,
    ...(customerName  ? { customerName }  : {}),
    ...(customerPhone ? { customerPhone } : {}),
  });
  return ref.id;
}

export function subscribeArchives(uid: string, cb: (archives: Archive[]) => void): Unsubscribe {
  const q = query(archivesCol(uid), orderBy('savedAt', 'desc'));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Archive));
  });
}

export async function deleteArchive(uid: string, archiveId: string): Promise<void> {
  await deleteDoc(doc(archivesCol(uid), archiveId));
}

/* ── 명함(설정) ─────────────────────────────── */
export async function getBusinessCard(uid: string): Promise<BusinessCard | null> {
  const snap = await getDoc(doc(db, 'settings', uid));
  if (!snap.exists()) return null;
  return (snap.data() as { businessCard: BusinessCard }).businessCard;
}

export async function saveBusinessCard(uid: string, card: BusinessCard): Promise<void> {
  await setDoc(doc(db, 'settings', uid), { businessCard: card, updatedAt: Date.now() });
}
