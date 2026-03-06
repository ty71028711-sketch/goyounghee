'use client';

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithRedirect, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import {
  getAppUser, createAppUser, registerDevice, getDevices,
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
  loginError:      string | null;
  pendingNewUser:  User | null;
  signInWithGoogle: () => Promise<void>;
  logout:           () => Promise<void>;
  completeSignup:   (name: string, phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null, appUser: null, isAdmin: false,
  loading: true, deviceError: null, expiryError: null, loginError: null,
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

/* ── 기기 제한 초과 팝업 (어느 페이지에서든 표시) ── */
function DeviceErrorModal({ error, onLogout }: { error: string; onLogout: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
        <div className="px-8 py-9 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="text-slate-900 font-extrabold text-xl leading-snug mb-3">기기 접근 제한</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6 whitespace-pre-line">{error}</p>
          <a
            href="http://pf.kakao.com/_LDfqX/chat"
            target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#f5dc00] active:scale-[.98] text-[#3A1D1D] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-yellow-200 mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3A1D1D">
              <path d="M12 3C6.48 3 2 6.69 2 11.25c0 2.91 1.72 5.48 4.35 7.02l-.87 3.19a.5.5 0 0 0 .74.57l3.73-2.15c.64.09 1.3.14 1.97.14 5.52 0 10-3.69 10-8.25S17.52 3 12 3z"/>
            </svg>
            카카오로 기기 교체 요청
          </a>
          <button
            onClick={onLogout}
            className="w-full py-3 text-slate-400 hover:text-slate-600 text-sm font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
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
  const [loginError,     setLoginError]     = useState<string | null>(null);
  const [pendingNewUser, setPendingNewUser] = useState<User | null>(null);

  const userDocUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // 프로덕션에서만 리다이렉트 결과 처리 (로컬은 popup 사용)
    if (process.env.NODE_ENV !== 'development') {
      getRedirectResult(auth).catch((err: unknown) => {
        const code = (err as { code?: string }).code;
        if (!code) return;
        console.error('[Auth] 리다이렉트 로그인 오류:', err);
        if (code === 'auth/unauthorized-domain') {
          setLoginError('이 도메인에서는 로그인이 허용되지 않습니다. 관리자에게 문의하세요.');
        } else {
          setLoginError('로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }
      });
    }

    // 6초 절대 안전 타이머 — onAuthStateChanged 자체가 응답 없을 때
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 3_000);

    const unsub = onAuthStateChanged(auth, async (user) => {
      clearTimeout(safetyTimer);

      // 인증 플로우가 어떤 이유로든 hang되더라도 최대 15초 후 강제 해제
      const flowTimer = setTimeout(() => setLoading(false), 15_000);

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
        clearTimeout(flowTimer);
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
        const isExpired = aUser.expiryDate != null && aUser.expiryDate < Date.now();
        // planStatus 필드 자체가 없는(undefined) 경우는 데이터 마이그레이션 문제이므로
        // 명시적으로 비활성 값이 설정된 경우에만 차단 (undefined는 통과)
        const isNotActive = aUser.planStatus != null && aUser.planStatus !== '사용중';
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

      // ── APPROVED 유저: 즉시 입장, 기기 체크는 백그라운드 ──
      setIsAdmin(isSuperAdmin);
      setAppUser(aUser);

      // 실시간 구독 시작
      userDocUnsubRef.current = subscribeUserDoc(user.uid, (updated) => {
        if (!updated) return;
        if (updated.status === 'rejected') { signOut(auth); return; }
        const isExpired   = updated.expiryDate != null && updated.expiryDate < Date.now();
        const isNotActive = updated.planStatus != null && updated.planStatus !== '사용중';
        if (!isSuperAdmin && (isExpired || isNotActive)) {
          setExpiryError('서비스 이용 기간이 만료되었습니다.\n연장 문의 부탁드립니다.');
        }
        setAppUser(updated);
      });

      // 슈퍼어드민은 기기 체크 생략
      if (isSuperAdmin) return;

      // 백그라운드 기기 체크 (2초 타임아웃, 초과 시 통과)
      (async () => {
        try {
          const deviceId   = getDeviceId();
          const deviceType = getDeviceType();
          const deviceName = getDeviceName();

          const devices = await withTimeout(getDevices(user.uid), 2_000);
          const already  = devices.find(d => d.deviceId === deviceId);
          const sameType = devices.filter(d => d.deviceType === deviceType);

          if (!already && sameType.length >= 1) {
            // 기기 제한 초과 → 팝업 표시 (사용자가 직접 로그아웃)
            setDeviceError(
              deviceType === 'pc'
                ? 'PC 기기가 이미 1대 등록되어 있습니다.\n관리자에게 기기 교체를 요청하세요.'
                : '모바일 기기가 이미 1대 등록되어 있습니다.\n관리자에게 기기 교체를 요청하세요.'
            );
            return;
          }

          // 기기 등록 (fire and forget)
          const devicePayload = already
            ? { ...already, lastLogin: Date.now() }
            : { deviceId, deviceType, deviceName, lastLogin: Date.now(), registeredAt: Date.now() };

          registerDevice(user.uid, devicePayload).catch(err =>
            console.warn('[Auth] 기기 등록 실패:', err)
          );
        } catch {
          // 2초 타임아웃 또는 기타 오류 → 네트워크 느림으로 간주, 통과
          console.warn('[Auth] 기기 체크 타임아웃, 통과 처리');
        }
      })();

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
    setLoginError(null);
    try {
      if (process.env.NODE_ENV === 'development') {
        // 로컬 개발: popup 방식 (redirect는 localhost에서 third-party cookie 문제)
        await signInWithPopup(auth, googleProvider);
      } else {
        // 프로덕션: redirect 방식
        await signInWithRedirect(auth, googleProvider);
        // 브라우저가 Google로 리다이렉트됨 — 이하 코드 실행 안 됨
      }
    } catch (err: unknown) {
      console.error('[Auth] Google 로그인 시작 오류:', err);
      setLoginError('로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
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
    setLoginError(null);
    setPendingNewUser(null);
  }

  return (
    <AuthContext.Provider value={{
      firebaseUser, appUser, isAdmin, loading,
      deviceError, expiryError, loginError, pendingNewUser,
      signInWithGoogle, logout, completeSignup,
    }}>
      {loading ? <GlobalSpinner /> : children}
      {/* 기기 제한 초과 팝업 — loading 해제 후 어느 페이지에서든 표시 */}
      {!loading && firebaseUser && deviceError && (
        <DeviceErrorModal error={deviceError} onLogout={logout} />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
