import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, onSnapshot, addDoc,
  query, orderBy, Unsubscribe,
} from 'firebase/firestore';
<<<<<<< HEAD
import { db } from '@/auth/firebase';
import { auth } from '@/auth/firebase';
import { ApplicationForm, ApplicationStatus } from '@/types';
=======
import { db } from './firebase';
import { AppUser, ApplicationForm, ApplicationStatus, Archive, BusinessCard, DeviceInfo, Visit } from '@/types';
>>>>>>> dc86bc4ac8b66211275c78d9715f7ed469cacf3c

/* ── 이메일 사전 승인 ──────────────────────────── */
interface PreApproval {
  email: string;
  name: string;
  phone: string;
  planLabel: string;
  days: number;
  approvedAt: number;
}

export async function createPreApproval(
  email: string, name: string, phone: string, days: number, planLabel: string
): Promise<void> {
  const cu = auth.currentUser;
  const path = `preApprovals/${email.toLowerCase()}`;
  console.log(`[FIRESTORE] createPreApproval | path=${path}`);
  console.log(`[FIRESTORE] auth.currentUser | uid=${cu?.uid ?? 'null'} | email=${cu?.email ?? 'null'} | emailVerified=${cu?.emailVerified}`);
  await setDoc(doc(db, 'preApprovals', email.toLowerCase()), {
    email: email.toLowerCase(), name, phone, planLabel, days, approvedAt: Date.now(),
  });
  console.log(`[FIRESTORE] createPreApproval 성공 | path=${path}`);
}

<<<<<<< HEAD
export async function getPreApproval(email: string): Promise<PreApproval | null> {
  const snap = await getDoc(doc(db, 'preApprovals', email.toLowerCase()));
  return snap.exists() ? (snap.data() as PreApproval) : null;
}

export async function deletePreApproval(email: string): Promise<void> {
  await deleteDoc(doc(db, 'preApprovals', email.toLowerCase()));
=======
export async function approveOneYear(uid: string): Promise<void> {
  const now = Date.now();
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  await updateDoc(doc(db, 'users', uid), {
    status:     'approved',
    planStatus: 'active',
    planType:   'paid',
    approvedAt: now,
    expiryDate: now + ONE_YEAR_MS,
  });
}

export async function startFreeTrial(uid: string): Promise<void> {
  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  await updateDoc(doc(db, 'users', uid), {
    status:     'approved',
    planStatus:   'trial',
    planType:     'trial',
    approvedAt:   now,
    trialStartAt: now,
    expiryDate:   now + SEVEN_DAYS_MS,
  });
}

export async function softDeleteUser(uid: string, reason?: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    status:        'deleted',
    planStatus:    'inactive',
    deletedAt:     Date.now(),
    deletedReason: reason ?? null,
  });
}

export async function hardDeleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}

export async function resetToPending(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    status:     'pending',
    planStatus: 'inactive',
    planType:   null,
    approvedAt: null,
    expiryDate: null,
  });
}

/* 기기 목록: /users/${uid} 문서의 devices 배열 필드에 저장 */
export async function getDevices(uid: string): Promise<DeviceInfo[]> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ((snap.data() as AppUser).devices ?? []) : [];
}

export async function registerDevice(uid: string, device: DeviceInfo): Promise<void> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return;
  const existing = (snap.data() as AppUser).devices ?? [];
  const devices = [...existing.filter(d => d.deviceId !== device.deviceId), device];
  await updateDoc(doc(db, 'users', uid), { devices });
}

export async function revokeDevice(uid: string, deviceId: string): Promise<void> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return;
  const existing = (snap.data() as AppUser).devices ?? [];
  const devices = existing.filter(d => d.deviceId !== deviceId);
  await updateDoc(doc(db, 'users', uid), { devices });
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
>>>>>>> dc86bc4ac8b66211275c78d9715f7ed469cacf3c
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

export async function deleteApplication(id: string): Promise<void> {
  await deleteDoc(doc(db, 'applications', id));
}
