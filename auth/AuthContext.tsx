'use client';

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithRedirect, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import {
  getAppUser, createAppUser, registerDevice, getDevices,
  subscribeUserDoc, updateUserStatus,
} from './userStore';
import { getDeviceId, getDeviceType, getDeviceName } from './deviceFingerprint';
import { getPreApproval, deletePreApproval } from '@/lib/firestore';
import { AppUser } from '@/types';
import { canAccess } from '@/lib/utils';

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

/* ── 브라우저 환경 감지 ── */
function isMobileBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Mobile|Android|iPhone|iPad|iPod/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Mac/i.test(ua));
}

/** 카카오톡·인스타·페이스북 등 인앱 WebView 감지 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/KAKAOTALK/i.test(ua))                  return true; // 카카오톡
  if (/Instagram|FBAN|FBAV/i.test(ua))        return true; // 인스타·페이스북
  if (/Twitter/i.test(ua))                    return true;
  if (/Line\//i.test(ua))                     return true;
  if (/NAVER\(|NaverSearch|naverapp/i.test(ua)) return true; // 네이버
  if (/Android/.test(ua) && /; wv\)/.test(ua)) return true; // Android WebView
  return false;
}

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
  // [FIX-1] GlobalSpinner는 최초 1회만. false 이후 절대 true로 돌아가지 않음
  const [initialLoading, setInitialLoading] = useState(true);
  const [deviceError,    setDeviceError]    = useState<string | null>(null);
  const [expiryError,    setExpiryError]    = useState<string | null>(null);
  const [loginError,     setLoginError]     = useState<string | null>(null);
  const [pendingNewUser, setPendingNewUser] = useState<User | null>(null);

  const userDocUnsubRef = useRef<(() => void) | null>(null);
  // [FIX-2] 승인 완료 후 onAuthStateChanged 재발화(StrictMode 이중마운트) 시 setLoading(true) 차단
  const approvedRef = useRef(false);

  useEffect(() => {
    // 리다이렉트 결과 처리 — dev/prod 무관하게 항상 호출 (결과 없으면 null 반환, 안전)
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('[Auth] 리다이렉트 로그인 성공:', result.user.email);
        }
      })
      .catch((err: unknown) => {
        const code    = (err as { code?: string }).code ?? '';
        const message = (err as { message?: string }).message ?? '';
        console.error('[Auth] 리다이렉트 로그인 오류 — code:', code, '| message:', message);

        if (!code && !message) return; // 실제 오류 없음

        if (code === 'auth/unauthorized-domain') {
          setLoginError('이 도메인에서는 로그인이 허용되지 않습니다. 관리자에게 문의하세요.');
        } else if (
          message.includes('disallowed_useragent') ||
          code === 'auth/operation-not-allowed'
        ) {
          setLoginError(
            '앱 내 브라우저(카카오톡·인스타 등)에서는 Google 로그인이 차단됩니다.\nChrome 또는 Safari로 열어주세요.'
          );
        } else if (code || message) {
          setLoginError('로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }
      });

    // 3초 절대 안전 타이머 — onAuthStateChanged 자체가 응답 없을 때
    const safetyTimer = setTimeout(() => {
      console.log('[AUTH-03] safetyTimer(3s) 발동 → loading 해제');
      setLoading(false);
      setInitialLoading(false);
    }, 3_000);

    const unsub = onAuthStateChanged(auth, async (user) => {
      clearTimeout(safetyTimer);
      console.log(`[AUTH-04] onAuthStateChanged | uid=${user?.uid ?? 'null'} | approvedRef=${approvedRef.current}`);

      // [FIX-4] flowTimer: 5s → 3s (safetyTimer·withTimeout·localTimeout 모두 3s로 통일)
      const flowTimer = setTimeout(() => {
        console.log('[AUTH-05] flowTimer(3s) 초과 → loading 강제 해제');
        setLoading(false);
        setInitialLoading(false);
      }, 3_000);

      userDocUnsubRef.current?.();
      userDocUnsubRef.current = null;
      setFirebaseUser(user);
      setPendingNewUser(null);

      try {
        if (user) {
          await handleUserLogin(user);
        } else {
          console.log('[AUTH-04B] user=null → 로그아웃 상태');
          approvedRef.current = false;
          setAppUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('[AUTH-04E] 인증 플로우 오류:', err);
        approvedRef.current = false;
        setAppUser(null);
        setIsAdmin(false);
      } finally {
        clearTimeout(flowTimer);
        console.log('[AUTH-10] finally → setLoading(false)');
        setLoading(false);
        setInitialLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsub();
      userDocUnsubRef.current?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUserLogin(user: User) {
    // [FIX-2 적용] approvedRef=true 이면 loading=true 생략 → GlobalSpinner 재등장 방지
    if (!approvedRef.current) {
      console.log('[AUTH-06] handleUserLogin: setLoading(true)');
      setLoading(true);
    } else {
      console.log('[AUTH-06] handleUserLogin: approvedRef=true → setLoading(true) 생략 (백그라운드 재검증)');
    }
    setDeviceError(null);
    setExpiryError(null);

    try {
      const superAdminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
        .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
      const isSuperAdmin = superAdminEmails.includes((user.email ?? '').toLowerCase());
      console.log(`[AUTH-07] 어드민 체크 | email=${user.email} | isSuperAdmin=${isSuperAdmin}`);

      let aUser = await withTimeout(getAppUser(user.uid), 3_000);
      console.log(`[AUTH-08] Firestore 유저 | status=${aUser?.status} | planStatus=${aUser?.planStatus} | expiryDate=${aUser?.expiryDate}`);

      // ── 신규 유저 ──
      if (!aUser) {
        // 이메일 사전 승인 확인
        const preApproval = await withTimeout(getPreApproval(user.email ?? ''), 3_000).catch(() => null);
        if (preApproval) {
          console.log(`[AUTH-08B] 사전 승인 발견 | email=${user.email} | planLabel=${preApproval.planLabel}`);
          const now = Date.now();
          const newUserData: Omit<AppUser, 'devices'> = {
            uid:         user.uid,
            email:       user.email ?? '',
            displayName: user.displayName ?? '',
            name:        preApproval.name || user.displayName || '',
            phone:       preApproval.phone || '',
            photoURL:    user.photoURL ?? '',
            status:      'approved',
            planStatus:  '사용중',
            planLabel:   preApproval.planLabel,
            createdAt:   now,
            approvedAt:  now,
            expiryDate:  preApproval.days > 0 ? now + preApproval.days * 24 * 60 * 60 * 1000 : null,
          };
          await withTimeout(createAppUser(newUserData), 5_000);
          await withTimeout(deletePreApproval(user.email ?? ''), 3_000).catch(() => {});
          aUser = { ...newUserData, devices: [] };
        } else {
          setPendingNewUser(user);
          return;
        }
      }

      // ── 슈퍼어드민 자동 승인 ──
      if (isSuperAdmin && !canAccess(aUser)) {
        await withTimeout(updateUserStatus(user.uid, 'approved', true), 5_000);
        aUser = { ...aUser, status: 'approved', planStatus: 'active', expiryDate: null };
      }

      // ── 거부된 계정 ──
      if (aUser.status === 'rejected') {
        await signOut(auth);
        setAppUser(null);
        return;
      }

      // ── 만료 / 미활성 체크 (슈퍼어드민 제외) ──
      if (!isSuperAdmin && aUser.status === 'approved' && !canAccess(aUser)) {
        setExpiryError('서비스 이용 기간이 만료되었습니다.\n연장 문의 부탁드립니다.');
        setAppUser(aUser);
        return;
      }

      // ── PENDING 유저: 승인 대기 실시간 구독 ──
      if (aUser.status !== 'approved') {
        setAppUser(aUser);
        userDocUnsubRef.current = subscribeUserDoc(user.uid, (updated) => {
          if (!updated) return;
          if (updated.status === 'rejected') { signOut(auth); return; }
          if (canAccess(updated)) {
            window.location.reload();
            return;
          }
          setAppUser(updated);
        });
        return;
      }

      // ── APPROVED 유저: 즉시 입장, 기기 체크는 백그라운드 ──
      console.log('[AUTH-09] approved → approvedRef=true, 대시보드 진입 허용');
      approvedRef.current = true;
      setIsAdmin(isSuperAdmin);
      setAppUser(aUser);

      // 실시간 구독 시작
      userDocUnsubRef.current = subscribeUserDoc(user.uid, (updated) => {
        if (!updated) return;
        if (updated.status === 'rejected') { signOut(auth); return; }
        if (!isSuperAdmin && updated.status === 'approved' && !canAccess(updated)) {
          setExpiryError('서비스 이용 기간이 만료되었습니다.\n연장 문의 부탁드립니다.');
        }
        setAppUser(updated);
      });

      // 슈퍼어드민은 기기 체크 생략
      if (isSuperAdmin) return;

      // 백그라운드 기기 체크 (Firestore 최신 devices 읽기)
      (async () => {
        try {
          const deviceId   = getDeviceId();
          const deviceType = getDeviceType();
          const deviceName = getDeviceName();

          // 로그인 시점 스냅샷(aUser.devices)이 아닌 Firestore 최신값으로 체크
          const devices  = await withTimeout(getDevices(user.uid), 5_000);
          const already  = devices.find(d => d.deviceId === deviceId);
          const sameType = devices.filter(d => d.deviceType === deviceType);

          if (!already && sameType.length >= 1) {
            // 기기 제한 초과 (PC 1대 + 모바일 1대) → 팝업 표시
            setDeviceError(
              deviceType === 'pc'
                ? 'PC 기기가 이미 1대 등록되어 있습니다.\n관리자에게 기기 교체를 요청하세요.'
                : '모바일 기기가 이미 1대 등록되어 있습니다.\n관리자에게 기기 교체를 요청하세요.'
            );
            return;
          }

          // 기기 등록 (await로 완료 보장)
          const devicePayload = already
            ? { ...already, lastLogin: Date.now() }
            : { deviceId, deviceType, deviceName, lastLogin: Date.now(), registeredAt: Date.now() };

          await registerDevice(user.uid, devicePayload);
        } catch (err) {
          console.warn('[Auth] 기기 체크 오류:', err);
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
        if (canAccess(updated)) {
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
    console.log('[AUTH-01] signInWithGoogle 시작');
    setLoginError(null);

    // 인앱 브라우저(카카오톡·인스타 등) 사전 차단
    if (isInAppBrowser()) {
      console.warn('[AUTH-01] 인앱 브라우저 감지 → 로그인 차단');
      setLoginError(
        '카카오톡·인스타그램 등 앱 내 브라우저에서는 Google 로그인이 차단됩니다.\nChrome 또는 Safari로 열어서 로그인해 주세요.'
      );
      return;
    }

    // 모바일은 항상 redirect (dev 포함) — popup은 모바일 WebView로 처리되어 Google이 차단
    const mobile = isMobileBrowser();
    const useRedirect = mobile;

    try {
      if (useRedirect) {
        console.log(`[AUTH-02] signInWithRedirect 시작 (mobile=${mobile})`);
        await signInWithRedirect(auth, googleProvider);
        // 브라우저가 Google로 리다이렉트됨 — 이하 코드 실행 안 됨
      } else {
        console.log('[AUTH-02] signInWithPopup 시작 (desktop)');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('[AUTH-POPUP-SUCCESS]', result.user?.uid, result.user?.email);
        console.log('[AUTH-02B] signInWithPopup 완료 → onAuthStateChanged 대기');
      }
    } catch (err: unknown) {
      console.error('[Auth] Google 로그인 시작 오류:', err);
      setLoginError('로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  async function logout() {
    console.log('[AUTH-11] logout → approvedRef=false');
    approvedRef.current = false;
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
      {/* [FIX-1] initialLoading 사용: 최초 1회만 GlobalSpinner, 이후 loading 재진입해도 재등장 없음 */}
      {initialLoading ? <GlobalSpinner /> : children}
      {/* 기기 제한 초과 팝업 — loading 해제 후 어느 페이지에서든 표시 */}
      {!loading && firebaseUser && deviceError && (
        <DeviceErrorModal error={deviceError} onLogout={logout} />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
