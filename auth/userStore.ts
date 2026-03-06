import {
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  collection, onSnapshot, Unsubscribe,
} from 'firebase/firestore';
import { db, FIREBASE_APP_ID } from './firebase';
import { AppUser, DeviceInfo } from '@/types';

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
    planStatus: status === 'approved' ? '사용중' : '이용종료',
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

/* 기기 저장 경로: /artifacts/${appId}/users/${uid}/devices/${deviceId} */
function devicesCol(uid: string) {
  return collection(db, 'artifacts', FIREBASE_APP_ID, 'users', uid, 'devices');
}

export async function getDevices(uid: string): Promise<DeviceInfo[]> {
  const snap = await getDocs(devicesCol(uid));
  return snap.docs.map(d => d.data() as DeviceInfo);
}

export async function registerDevice(uid: string, device: DeviceInfo): Promise<void> {
  await setDoc(doc(devicesCol(uid), device.deviceId), device);
}

export async function revokeDevice(uid: string, deviceId: string): Promise<void> {
  await deleteDoc(doc(devicesCol(uid), deviceId));
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
