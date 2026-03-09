import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, onSnapshot, addDoc,
  query, orderBy, Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/firebase';
import { auth } from '@/auth/firebase';
import { ApplicationForm, ApplicationStatus } from '@/types';

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

export async function getPreApproval(email: string): Promise<PreApproval | null> {
  const snap = await getDoc(doc(db, 'preApprovals', email.toLowerCase()));
  return snap.exists() ? (snap.data() as PreApproval) : null;
}

export async function deletePreApproval(email: string): Promise<void> {
  await deleteDoc(doc(db, 'preApprovals', email.toLowerCase()));
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
