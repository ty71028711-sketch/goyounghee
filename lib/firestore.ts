import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, onSnapshot, addDoc,
  query, orderBy, Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '@/auth/firebase';
import { ApplicationForm, ApplicationStatus } from '@/types';

/* ── 이메일 사전 승인 ─────────────────────────── */
interface PreApproval {
  email:      string;
  name:       string;
  phone:      string;
  planLabel:  string;
  days:       number;
  approvedAt: number;
}

export async function createPreApproval(
  email: string, name: string, phone: string, days: number, planLabel: string
): Promise<void> {
  const cu   = auth.currentUser;
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

/* ── 관리자 전용: 사용자 상태 전환 ──────────────── */
const SEVEN_DAYS_MS = 7   * 24 * 60 * 60 * 1000;
const ONE_YEAR_MS   = 365 * 24 * 60 * 60 * 1000;

/** 신청 → 7일 무료체험 승인 */
export async function adminStartTrial(uid: string): Promise<void> {
  const now = Date.now();
  await updateDoc(doc(db, 'users', uid), {
    status:       'approved',
    planStatus:   'trial',
    planLabel:    '7일 무료체험',
    approvedAt:   now,
    trialStartAt: now,
    expiryDate:   now + SEVEN_DAYS_MS,
  });
}

/** 신청 / 만료 → 1년 유료 승인 */
export async function adminApproveAnnual(uid: string): Promise<void> {
  const now = Date.now();
  await updateDoc(doc(db, 'users', uid), {
    status:     'approved',
    planStatus: 'active',
    planLabel:  '1년 구독',
    approvedAt: now,
    expiryDate: now + ONE_YEAR_MS,
  });
}

/** 회원 → 보관함 (소프트 삭제) */
export async function adminArchiveUser(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    status:     'deleted',
    planStatus: 'inactive',
    archivedAt: Date.now(),
  });
}

/** 보관함 → 완전 삭제 */
export async function adminHardDeleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}

/* ── 서비스 신청서 ──────────────────────────────── */
export async function submitApplication(
  data: Omit<ApplicationForm, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'applications'), {
    ...data,
    createdAt: Date.now(),
    status:    '신청완료',
  });

  // uid가 있을 경우 users/{uid} 문서도 함께 생성 (없을 때만)
  // → adminStartTrial/adminApproveAnnual 이 updateDoc 으로 작동하려면 문서가 미리 있어야 함
  if (data.uid) {
    const userRef = doc(db, 'users', data.uid);
    const snap    = await getDoc(userRef);
    if (!snap.exists()) {
      const cu = auth.currentUser;
      await setDoc(userRef, {
        uid:         data.uid,
        email:       data.googleEmail,
        displayName: cu?.displayName ?? '',
        name:        data.name,
        phone:       data.phone,
        photoURL:    cu?.photoURL ?? '',
        status:      'pending',
        planStatus:  '승인대기',
        expiryDate:  null,
        createdAt:   Date.now(),
        devices:     [],
      });
    }
  }

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

/* ── 관리자: users 문서의 devices 배열에서 기기 제거 ─── */
export async function adminRemoveDeviceFromUserDoc(uid: string, deviceId: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const current: Array<{ deviceId: string }> = snap.data().devices ?? [];
  await updateDoc(userRef, { devices: current.filter(d => d.deviceId !== deviceId) });
}
