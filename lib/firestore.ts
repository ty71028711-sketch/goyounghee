import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, onSnapshot, addDoc,
  query, orderBy, Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { AppUser, ApplicationForm, ApplicationStatus, Archive, BusinessCard, DeviceInfo, Visit } from '@/types';

/* ── 사용자 ─────────────────────────────────── */
export async function getAppUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function createAppUser(user: Omit<AppUser, 'devices'>): Promise<void> {
  await setDoc(doc(db, 'users', user.uid), { ...user, devices: [] });
}

export async function updateUserStatus(uid: string, status: 'approved' | 'rejected', noExpiry = false): Promise<void> {
  const now = Date.now();
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  await updateDoc(doc(db, 'users', uid), {
    status,
    approvedAt: status === 'approved' ? now : null,
    expiryDate: status === 'approved' ? (noExpiry ? null : now + ONE_YEAR_MS) : null,
  });
}

export async function approveOneYear(uid: string): Promise<void> {
  const now = Date.now();
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  await updateDoc(doc(db, 'users', uid), {
    status:     'approved',
    planStatus: '사용중',
    approvedAt: now,
    expiryDate: now + ONE_YEAR_MS,
  });
}

export async function registerDevice(uid: string, device: DeviceInfo): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const snap    = await getDoc(userRef);
  if (!snap.exists()) return;
  const data    = snap.data() as AppUser;
  const devices = data.devices || [];
  const existing = devices.findIndex(d => d.deviceId === device.deviceId);
  if (existing >= 0) {
    devices[existing].lastLogin = Date.now();
  } else {
    devices.push(device);
  }
  await updateDoc(userRef, { devices });
}

export async function revokeDevice(uid: string, deviceId: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const snap    = await getDoc(userRef);
  if (!snap.exists()) return;
  const data    = snap.data() as AppUser;
  await updateDoc(userRef, {
    devices: (data.devices || []).filter(d => d.deviceId !== deviceId),
  });
}

export function subscribeAllUsers(cb: (users: AppUser[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'users'), snap => {
    cb(snap.docs.map(d => d.data() as AppUser));
  });
}

export function subscribeUserDoc(uid: string, cb: (user: AppUser | null) => void): Unsubscribe {
  return onSnapshot(doc(db, 'users', uid), snap => {
    cb(snap.exists() ? (snap.data() as AppUser) : null);
  });
}


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

export async function saveArchive(uid: string, visits: Visit[]): Promise<string> {
  const now = new Date();
  const visitDate = now.toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'short' });
  const ref = await addDoc(archivesCol(uid), {
    savedAt:    now.getTime(),
    visitDate,
    visitCount: visits.length,
    visits,
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

/* ── 서비스 신청서 ──────────────────────────── */
export async function submitApplication(
  data: Omit<ApplicationForm, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'applications'), {
    ...data,
    createdAt: Date.now(),
    status: '신청완료',
  });
  return ref.id;
}

export function subscribeApplications(cb: (apps: ApplicationForm[]) => void): Unsubscribe {
  const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as ApplicationForm));
  });
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<void> {
  await updateDoc(doc(db, 'applications', id), { status });
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
