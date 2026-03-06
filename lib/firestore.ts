import {
  doc, updateDoc,
  collection, onSnapshot, addDoc,
  query, orderBy, Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/firebase';
import { ApplicationForm, ApplicationStatus } from '@/types';

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
