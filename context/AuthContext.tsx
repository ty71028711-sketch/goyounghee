'use client';

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import {
  getAppUser, createAppUser, registerDevice,
  subscribeUserDoc, updateUserStatus,
} from '@/lib/firestore';
import { getDeviceId, getDeviceType, getDeviceName } from '@/lib/deviceFingerprint';
import { AppUser } from '@/types';

interface AuthContextValue {
  firebaseUser:    User | null;
  appUser:         AppUser | null;
  isAdmin:         boolean;
  loading:         boolean;
  deviceError:     string | null;
  expiryError:     string | null;
  pendingNewUser:  User | null;
  signInWithGoogle: () => Promise<void>;
  logout:           () => Promise<void>;
  completeSignup:   (name: string, phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null, appUser: null, isAdmin: false,
  loading: true, deviceError: null, expiryError: null,
  pendingNewUser: null,
  signInWithGoogle: async () => {}, logout: async () => {},
  completeSignup: async () => {},
});

/* ── 타임아웃 헬퍼 ── */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error(`timeout_${ms}ms`)), ms)
    ),
  ]);
}

/* ── 전역 스피너 ── */
function GlobalSpinner() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white gap-5 z-[9999]">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin" />
      <p className="text-[13px] text-slate-500">소장님, 정보를 불러오는 중입니다...</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-1 px-4 py-2 text-[12px] text-slate-400 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
      >
        새로고침
      </button>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser,   setFirebaseUser]   = useState<User | null>(null);
  const [appUser,        setAppUser]        = useState<AppUser | null>(null);
  const [isAdmin,        setIsAdmin]        = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [deviceError,    setDeviceError]    = useState<string | null>(null);
  const [expiryError,    setExpiryError]    = useState<string | null>(null);
  const [pendingNewUser, setPendingNewUser] = useState<User | null>(null);

  const userDocUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // 6초 절대 안전 타이머 — onAuthStateChanged 자체가 응답 없을 때
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 6_000);

    const unsub = onAuthStateChanged(auth, async (user) => {
      clearTimeout(safetyTimer);

      userDocUnsubRef.current?.();
      userDocUnsubRef.current = null;
      setFirebaseUser(user);
      setPendingNewUser(null);

      try {
        if (user) {
          await handleUserLogin(user);
        } else {
          setAppUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('[Auth] 인증 플로우 오류:', err);
        setAppUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsub();
      userDocUnsubRef.current?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUserLogin(user: User) {
    setLoading(true);
    setDeviceError(null);
    setExpiryError(null);

    try {
      const superAdminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
        .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
      const isSuperAdmin = superAdminEmails.includes((user.email ?? '').toLowerCase());

      let aUser = await withTimeout(getAppUser(user.uid), 5_000);

      // ── 신규 유저 ──
      if (!aUser) {
        setPendingNewUser(user);
        return;
      }

      // ── 슈퍼어드민 자동 승인 ──
      if (isSuperAdmin && (aUser.status !== 'approved' || aUser.planStatus !== '사용중')) {
        await withTimeout(updateUserStatus(user.uid, 'approved', true), 5_000);
        aUser = { ...aUser, status: 'approved', planStatus: '사용중', expiryDate: null };
      }

      // ── 거부된 계정 ──
      if (aUser.status === 'rejected') {
        await signOut(auth);
        setAppUser(null);
        return;
      }

      // ── 만료 / 미활성 체크 (슈퍼어드민 제외) ──
      if (!isSuperAdmin && aUser.status === 'approved') {
        const isExpired   = aUser.expiryDate != null && aUser.expiryDate < Date.now();
        const isNotActive = !aUser.planStatus || aUser.planStatus !== '사용중';
        if (isExpired || isNotActive) {
          setExpiryError('서비스 이용 기간이 만료되었습니다.\n연장 문의 부탁드립니다.');
          setAppUser(aUser);
          return;
        }
      }

      // ── PENDING 유저: 승인 대기 실시간 구독 ──
      if (aUser.status !== 'approved') {
        setAppUser(aUser);
        userDocUnsubRef.current = subscribeUserDoc(user.uid, (updated) => {
          if (!updated) return;
          if (updated.status === 'rejected') { signOut(auth); return; }
          if (updated.status === 'approved' && updated.planStatus === '사용중') {
            window.location.reload();
            return;
          }
          setAppUser(updated);
        });
        return;
      }

      // ── APPROVED 유저: 기기 등록 ──
      const deviceId   = getDeviceId();
      const deviceType = getDeviceType();
      const deviceName = getDeviceName();
      const devices    = aUser.devices ?? [];

      const already  = devices.find(d => d.deviceId === deviceId);
      const sameType = devices.filter(d => d.deviceType === deviceType);

      if (!isSuperAdmin && !already && sameType.length >= 1) {
        setDeviceError(
          deviceType === 'pc'
            ? 'PC 기기가 이미 1대 등록되어 있습니다.\n관리자에게 기기 교체를 요청하세요.'
            : '모바일 기기가 이미 1대 등록되어 있습니다.\n관리자에게 기기 교체를 요청하세요.'
        );
        setAppUser(aUser);
        setIsAdmin(isSuperAdmin);
        return;
      }

      const devicePayload = already
        ? { ...already, lastLogin: Date.now() }
        : { deviceId, deviceType, deviceName, lastLogin: Date.now(), registeredAt: Date.now() };

      // 기기 등록 — 5초 타임아웃, 실패해도 로그인 강행
      await withTimeout(registerDevice(user.uid, devicePayload), 5_000)
        .catch(err => console.warn('[Auth] 기기 등록 실패, 로그인 강행:', err));

      if (!already) {
        aUser = { ...aUser, devices: [...devices, devicePayload] };
      }

      setIsAdmin(isSuperAdmin);
      setAppUser(aUser);

      userDocUnsubRef.current = subscribeUserDoc(user.uid, (updated) => {
        if (!updated) return;
        if (updated.status === 'rejected') { signOut(auth); return; }
        const isExpired   = updated.expiryDate != null && updated.expiryDate < Date.now();
        const isNotActive = !updated.planStatus || updated.planStatus !== '사용중';
        if (!isSuperAdmin && (isExpired || isNotActive)) {
          setExpiryError('서비스 이용 기간이 만료되었습니다.\n연장 문의 부탁드립니다.');
        }
        setAppUser(updated);
      });

    } catch (err) {
      console.error('[Auth] handleUserLogin 오류:', err);
      throw err;
    }
  }

  async function completeSignup(name: string, phone: string) {
    if (!pendingNewUser) return;
    const user = pendingNewUser;
    setLoading(true);
    try {
      const newUser: Omit<AppUser, 'devices'> = {
        uid:         user.uid,
        email:       user.email ?? '',
        displayName: user.displayName ?? '',
        name,
        phone,
        photoURL:    user.photoURL ?? '',
        status:      'pending',
        planStatus:  '승인대기',
        expiryDate:  null,
        createdAt:   Date.now(),
      };
      await withTimeout(createAppUser(newUser), 5_000);
      const aUser: AppUser = { ...newUser, devices: [] };
      setPendingNewUser(null);
      setAppUser(aUser);

      userDocUnsubRef.current = subscribeUserDoc(user.uid, (updated) => {
        if (!updated) return;
        if (updated.status === 'rejected') { signOut(auth); return; }
        if (updated.status === 'approved' && updated.planStatus === '사용중') {
          window.location.reload();
          return;
        }
        setAppUser(updated);
      });
    } catch (err) {
      console.error('[Auth] completeSignup 오류:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      if ((err as { code?: string }).code !== 'auth/popup-closed-by-user') {
        console.error('[Auth] Google 로그인 오류:', err);
      }
    }
  }

  async function logout() {
    userDocUnsubRef.current?.();
    userDocUnsubRef.current = null;
    if (firebaseUser) {
      sessionStorage.removeItem(`session_visits_${firebaseUser.uid}`);
    }
    await signOut(auth);
    setAppUser(null);
    setIsAdmin(false);
    setDeviceError(null);
    setExpiryError(null);
    setPendingNewUser(null);
  }

  return (
    <AuthContext.Provider value={{
      firebaseUser, appUser, isAdmin, loading,
      deviceError, expiryError, pendingNewUser,
      signInWithGoogle, logout, completeSignup,
    }}>
      {loading ? <GlobalSpinner /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
