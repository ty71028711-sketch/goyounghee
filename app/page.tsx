'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ApplicationForm from '@/components/ApplicationForm';

export default function LoginPage() {
  const { firebaseUser, appUser, loading, deviceError, expiryError,
          pendingNewUser, signInWithGoogle, logout, completeSignup } = useAuth();
  const router = useRouter();

  const [signupName,    setSignupName]    = useState('');
  const [signupPhone,   setSignupPhone]   = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;
    // 로그아웃 시 리다이렉트 해제
    if (!firebaseUser) { setIsRedirecting(false); return; }
    if (!appUser)      return;
    if (deviceError)   return;
    if (expiryError)   return;
    if (appUser.status === 'approved' && appUser.planStatus === '사용중') {
      setIsRedirecting(true);
      const t = setTimeout(() => router.replace('/dashboard'), 900);
      return () => clearTimeout(t);
    }
  }, [loading, firebaseUser, appUser, deviceError, expiryError, router]);

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signupName.trim() || !signupPhone.trim()) return;
    setSignupLoading(true);
    await completeSignup(signupName.trim(), signupPhone.trim());
    setSignupLoading(false);
  }

  // ── 세션 체크 중 로딩 ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050d1f] flex flex-col items-center justify-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-900/50">
          <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
          </svg>
        </div>
        <p className="text-white font-bold text-lg tracking-tight">임장메이트 <span className="text-amber-400">PRO</span></p>
        <div className="flex items-center gap-1.5">
          {[0, 150, 300].map(delay => (
            <div key={delay} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }} />
          ))}
        </div>
        <p className="text-slate-500 text-sm">로그인 확인 중...</p>
      </div>
    );
  }

  // ── 하이패스 리다이렉트 (approved + 사용중 + 기기 통과) ──
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-[#050d1f] flex flex-col items-center justify-center gap-5 animate-fade-in-up">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-900/50 animate-pulse">
          <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
          </svg>
        </div>
        <p className="text-white font-bold text-lg tracking-tight">임장메이트 <span className="text-amber-400">PRO</span></p>
        <p className="text-amber-400 text-sm font-semibold">대시보드로 이동 중...</p>
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full animate-progress" />
        </div>
      </div>
    );
  }

  // ── 신규 회원: 성함 + 전화번호 입력 폼 ──
  if (pendingNewUser) {
    return (
      <div className="min-h-screen bg-[#050d1f] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
            </svg>
          </div>
          <span className="font-bold text-white text-base tracking-tight">임장메이트 <span className="text-blue-400">PRO</span></span>
        </div>
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700" />
          <div className="px-8 py-9">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 className="text-slate-900 font-extrabold text-xl text-center mb-1">추가 정보 입력</h2>
            <p className="text-slate-500 text-sm text-center mb-6">서비스 이용을 위해 아래 정보를 입력해 주세요</p>
            {pendingNewUser.photoURL && (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mb-5">
                <img src={pendingNewUser.photoURL} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-slate-800 font-bold text-sm truncate">{pendingNewUser.displayName}</p>
                  <p className="text-slate-400 text-xs truncate">{pendingNewUser.email}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1">성함 <span className="text-red-500">*</span></label>
                <input type="text" required value={signupName} onChange={e => setSignupName(e.target.value)}
                  placeholder="실명을 입력해 주세요"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1">전화번호 <span className="text-red-500">*</span></label>
                <input type="tel" required value={signupPhone} onChange={e => setSignupPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" disabled={signupLoading || !signupName.trim() || !signupPhone.trim()}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-blue-200 mt-2">
                {signupLoading ? '가입 중...' : '가입 신청하기'}
              </button>
            </form>
            <button onClick={logout} className="w-full mt-3 py-2.5 text-slate-400 hover:text-slate-600 text-sm font-semibold rounded-2xl hover:bg-slate-50 transition-colors">
              다른 계정으로 로그인
            </button>
          </div>
        </div>
        <p className="relative z-10 mt-6 text-blue-900/60 text-xs">입금 확인 후 최대 1시간 이내 서비스가 활성화됩니다</p>
      </div>
    );
  }

  // ── 승인 대기 안내 페이지 ──
  if (firebaseUser && appUser && appUser.status !== 'approved' && !deviceError && !expiryError) {
    return (
      <div className="min-h-screen bg-[#050d1f] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <path d="M9 22v-4h6v4"/>
              <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
            </svg>
          </div>
          <span className="font-bold text-white text-base tracking-tight">임장메이트 <span className="text-blue-400">PRO</span></span>
        </div>
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700" />
          <div className="px-8 py-9">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h2 className="text-slate-900 font-extrabold text-xl text-center leading-snug mb-3">
              반갑습니다!<br />임장메이트 PRO의<br />승인을 기다리고 있습니다.
            </h2>
            <p className="text-slate-500 text-sm text-center leading-relaxed mb-6">
              입금 확인 후 최대 <span className="text-blue-600 font-bold">1시간 이내</span>에 승인됩니다.<br />
              빠른 승인을 원하시면 아래 버튼을 눌러주세요.
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3 mb-6">
              {firebaseUser.photoURL
                ? <img src={firebaseUser.photoURL} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                : <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">👤</div>
              }
              <div className="min-w-0">
                <p className="text-slate-800 font-bold text-sm truncate">{firebaseUser.displayName}</p>
                <p className="text-slate-400 text-xs truncate">{firebaseUser.email}</p>
              </div>
            </div>
            <a href="http://pf.kakao.com/_LDfqX/chat" target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#f5dc00] active:scale-[.98] text-[#3A1D1D] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-yellow-200 mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3A1D1D">
                <path d="M12 3C6.48 3 2 6.69 2 11.25c0 2.91 1.72 5.48 4.35 7.02l-.87 3.19a.5.5 0 0 0 .74.57l3.73-2.15c.64.09 1.3.14 1.97.14 5.52 0 10-3.69 10-8.25S17.52 3 12 3z"/>
              </svg>
              카카오로 빠른 승인 문의
            </a>
            <button onClick={logout} className="w-full py-3 text-slate-400 hover:text-slate-600 text-sm font-semibold rounded-2xl hover:bg-slate-50 transition-colors">
              다른 계정으로 로그인
            </button>
          </div>
        </div>
        <p className="relative z-10 mt-6 text-blue-900/60 text-xs">승인 완료 시 자동으로 서비스가 시작됩니다</p>
      </div>
    );
  }

  // ── 기기 제한 오류 화면 ──
  if (firebaseUser && appUser && deviceError) {
    return (
      <div className="min-h-screen bg-[#050d1f] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <path d="M9 22v-4h6v4"/>
              <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
            </svg>
          </div>
          <span className="font-bold text-white text-base tracking-tight">임장메이트 <span className="text-blue-400">PRO</span></span>
        </div>
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
          <div className="px-8 py-9 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 className="text-slate-900 font-extrabold text-xl leading-snug mb-3">기기 접근 제한</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 whitespace-pre-line">{deviceError}</p>
            <a href="http://pf.kakao.com/_LDfqX/chat" target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#f5dc00] active:scale-[.98] text-[#3A1D1D] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-yellow-200 mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3A1D1D">
                <path d="M12 3C6.48 3 2 6.69 2 11.25c0 2.91 1.72 5.48 4.35 7.02l-.87 3.19a.5.5 0 0 0 .74.57l3.73-2.15c.64.09 1.3.14 1.97.14 5.52 0 10-3.69 10-8.25S17.52 3 12 3z"/>
              </svg>
              카카오로 기기 교체 요청
            </a>
            <button onClick={logout} className="w-full py-3 text-slate-400 hover:text-slate-600 text-sm font-semibold rounded-2xl hover:bg-slate-50 transition-colors">
              다른 계정으로 로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 서비스 만료 오류 화면 ──
  if (firebaseUser && appUser && expiryError) {
    return (
      <div className="min-h-screen bg-[#050d1f] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <path d="M9 22v-4h6v4"/>
              <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
            </svg>
          </div>
          <span className="font-bold text-white text-base tracking-tight">임장메이트 <span className="text-blue-400">PRO</span></span>
        </div>
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="px-8 py-9 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-slate-900 font-extrabold text-xl leading-snug mb-3">이용 기간 만료</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 whitespace-pre-line">{expiryError}</p>
            <a href="http://pf.kakao.com/_LDfqX/chat" target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#f5dc00] active:scale-[.98] text-[#3A1D1D] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-yellow-200 mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3A1D1D">
                <path d="M12 3C6.48 3 2 6.69 2 11.25c0 2.91 1.72 5.48 4.35 7.02l-.87 3.19a.5.5 0 0 0 .74.57l3.73-2.15c.64.09 1.3.14 1.97.14 5.52 0 10-3.69 10-8.25S17.52 3 12 3z"/>
              </svg>
              카카오로 연장 문의
            </a>
            <button onClick={logout} className="w-full py-3 text-slate-400 hover:text-slate-600 text-sm font-semibold rounded-2xl hover:bg-slate-50 transition-colors">
              다른 계정으로 로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────
  // 메인 랜딩 + 상세 페이지
  // ────────────────────────────────────────────────────
  return (
    <div className="bg-[#050d1f]">

      {/* ══════════════════════════════════════
          SECTION 1 · 히어로
      ══════════════════════════════════════ */}
      <div className="min-h-screen text-white flex flex-col relative overflow-hidden">
        {/* 배경 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-800/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        {/* 헤더 */}
        <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/40">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <path d="M9 22v-4h6v4"/>
                <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">임장메이트 <span className="text-blue-400">PRO</span></span>
          </div>
          <span className="text-xs text-blue-300/70 border border-blue-700/50 bg-blue-900/20 rounded-full px-3 py-1">
            공인중개사 전용
          </span>
        </header>

        {/* 히어로 본문 */}
        <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 px-6 py-10 max-w-6xl mx-auto w-full gap-12">

          {/* 텍스트 영역 */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm font-semibold mb-6">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse flex-shrink-0" />
              15년 차 현직 소장이 직접 만든 실무 100% 도구
            </div>

            <h1 className="font-black text-white leading-tight mb-6">
              <span className="block text-xl sm:text-2xl text-slate-400 font-bold mb-2">아직도 매물을 노트에 적으세요?</span>
              <span className="block text-3xl sm:text-5xl drop-shadow-[0_0_24px_rgba(255,255,255,0.12)]">
                임장 브리핑,<br />스마트폰 하나로<br />
                <span className="text-blue-400">완벽하게</span> 끝내세요!
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8">
              사무실에선 <span className="text-white font-bold bg-blue-600/20 rounded px-1">PC로 툭!</span>{' '}
              현장에선 <span className="text-white font-bold bg-blue-600/20 rounded px-1">폰으로 슥!</span><br />
              계약 성사율을 높이는 소장님만의 디지털 비서
            </p>

            {/* 구글 로그인 버튼 (비로그인 상태에서만 표시) */}
            {!firebaseUser && (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-3 bg-white hover:bg-slate-50 active:scale-[.98] text-slate-800 font-bold text-base px-7 py-4 rounded-2xl transition-all shadow-xl shadow-black/20 border border-slate-200">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google 계정으로 로그인
              </button>
            )}

          </div>

          {/* 스마트폰 모컵 (CSS) */}
          <div className="flex-shrink-0 relative">
            <div className="relative w-[260px] sm:w-[300px]">
              {/* 폰 외곽 */}
              <div className="bg-gradient-to-b from-slate-700 to-slate-900 rounded-[3rem] p-[3px] shadow-[0_30px_80px_-10px_rgba(37,99,235,0.5)]">
                <div className="bg-[#0a0f1e] rounded-[2.8rem] overflow-hidden">
                  {/* 상단 노치 */}
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-24 h-6 bg-slate-800 rounded-full" />
                  </div>
                  {/* 앱 화면 */}
                  <div className="px-4 pb-6 space-y-3">
                    {/* 앱 헤더 */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-white font-bold text-sm">임장메이트 PRO</p>
                        <p className="text-blue-400 text-[10px]">오늘 임장 매물 현황</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="4" y="2" width="16" height="20" rx="2"/>
                          <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01"/>
                        </svg>
                      </div>
                    </div>
                    {/* 통계 카드 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-600/20 border border-blue-600/30 rounded-2xl p-3">
                        <p className="text-blue-300 text-[9px] font-bold uppercase">오늘 임장</p>
                        <p className="text-white font-black text-2xl">8</p>
                        <p className="text-blue-400 text-[9px]">건</p>
                      </div>
                      <div className="bg-emerald-600/20 border border-emerald-600/30 rounded-2xl p-3">
                        <p className="text-emerald-300 text-[9px] font-bold uppercase">관심 매물</p>
                        <p className="text-white font-black text-2xl">3</p>
                        <p className="text-emerald-400 text-[9px]">건</p>
                      </div>
                    </div>
                    {/* 매물 리스트 */}
                    {[
                      { name: '래미안 101동 1502호', tag: '아파트', price: '5.2억', color: 'blue' },
                      { name: '힐스테이트 B동 802호', tag: '오피스텔', price: '2.8억', color: 'purple' },
                      { name: '신축빌라 201호', tag: '주택', price: '1.9억', color: 'emerald' },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white ${
                          item.color === 'blue' ? 'bg-blue-600' : item.color === 'purple' ? 'bg-purple-600' : 'bg-emerald-600'
                        }`}>{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[10px] font-bold truncate">{item.name}</p>
                          <p className="text-slate-400 text-[9px]">{item.tag}</p>
                        </div>
                        <span className="text-amber-400 text-[10px] font-black flex-shrink-0">{item.price}</span>
                      </div>
                    ))}
                    {/* 문자전송 버튼 */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl py-2.5 flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      <span className="text-white text-[10px] font-bold">고객 안내문자 전송</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* 반짝이는 알림 뱃지 */}
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/50 animate-pulse">
                실시간 연동
              </div>
            </div>
          </div>
        </main>

        {/* 스크롤 유도 */}
        <div className="relative z-10 flex justify-center pb-8">
          <div className="flex flex-col items-center gap-2 text-slate-500 text-xs animate-bounce">
            <span>아래로 스크롤</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 2 · 문제 제기
      ══════════════════════════════════════ */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-red-500 text-xs font-bold tracking-[0.2em] uppercase mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              더 이상 잃어버린 포스트잇 때문에<br />당황하지 마세요.
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
              현장에서 수첩을 뒤적이는 그 <strong className="text-red-500">5초</strong>, 고객의 마음은 이미 식어버립니다.
            </p>
          </div>

          {/* Before / After 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Before */}
            <div className="relative bg-red-50 border-2 border-red-200 rounded-3xl p-8 overflow-hidden">
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full">Before</div>
              <div className="mb-5">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-3">수기 장부의 현실</h3>
              </div>
              <ul className="space-y-3">
                {[
                  '포스트잇이 어디 붙었는지 기억 안 남',
                  '현장에서 수첩 페이지 넘기다 당황',
                  '고객 앞에서 "잠깐만요..." 5번',
                  '사무실 돌아와서야 문자 발송',
                  '다음 날 메모 내용 해독 불가',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="relative bg-blue-50 border-2 border-blue-300 rounded-3xl p-8 overflow-hidden">
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">After</div>
              <div className="mb-5">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-3">임장메이트 PRO</h3>
              </div>
              <ul className="space-y-3">
                {[
                  '모든 매물, 스마트폰에서 1초 검색',
                  '현장에서 당당하게 브리핑',
                  '고객 앞에서 버튼 하나로 문자 전송',
                  'PC↔모바일 실시간 동기화',
                  '사진·메모 모두 깔끔하게 보관',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 · 핵심 기능 3단 카드
      ══════════════════════════════════════ */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-xs font-bold tracking-[0.2em] uppercase mb-3">Core Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              현장 전문가를 위한<br />3가지 핵심 기능
            </h2>
            <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mt-5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* 카드 1: 초스피드 입력 */}
            <div className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              {/* 이미지/일러스트 영역 */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 h-44 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {/* 터치 일러스트 */}
                <div className="relative">
                  <div className="w-28 h-44 bg-white/10 border border-white/30 rounded-2xl flex flex-col p-3 gap-2">
                    <div className="h-2 bg-white/40 rounded w-3/4" />
                    <div className="h-2 bg-white/20 rounded w-1/2" />
                    <div className="mt-1 space-y-1.5">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-6 bg-white/10 border border-white/20 rounded-lg flex items-center px-2 gap-1.5">
                          <div className="w-3 h-3 bg-white/50 rounded-sm flex-shrink-0" />
                          <div className="h-1.5 bg-white/30 rounded flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 손가락 터치 */}
                  <div className="absolute -bottom-2 -right-4 text-4xl">👆</div>
                  {/* 반짝이는 원 */}
                  <div className="absolute bottom-6 right-2 w-8 h-8 bg-white/30 rounded-full animate-ping" />
                </div>
              </div>
              <div className="p-7">
                <span className="text-[11px] font-black text-blue-500 tracking-[0.2em] uppercase">Feature 01</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2 mb-3 leading-snug">
                  초스피드 입력<br />
                  <span className="text-blue-600">터치 한 번으로 끝</span>
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  복잡한 매물 정보도 손가락 몇 번의 터치로 완성. 아파트·오피스텔·분양권·주택 카테고리별로 맞춤 입력 화면이 펼쳐집니다.
                </p>
              </div>
            </div>

            {/* 카드 2: 지능형 필터링 */}
            <div className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-44 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {/* 필터 UI 일러스트 */}
                <div className="w-48 space-y-2 px-4">
                  {[
                    { label: '반려동물 가능', active: true },
                    { label: '주차 2대 이상', active: true },
                    { label: '엘리베이터', active: false },
                    { label: '남향', active: false },
                  ].map((f, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border ${
                      f.active ? 'bg-white/25 border-white/50' : 'bg-white/5 border-white/20'
                    }`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                        f.active ? 'bg-white' : 'bg-white/20 border border-white/30'
                      }`}>
                        {f.active && (
                          <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-[11px] font-bold ${f.active ? 'text-white' : 'text-white/50'}`}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-7">
                <span className="text-[11px] font-black text-indigo-500 tracking-[0.2em] uppercase">Feature 02</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2 mb-3 leading-snug">
                  지능형 필터링<br />
                  <span className="text-indigo-600">원하는 매물만 쏙쏙</span>
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  &quot;반려동물 가능&quot;, &quot;주차 2대&quot; 같은 고객 니즈를 체크 하나로 필터링. 고객 맞춤 매물을 1초 만에 추려냅니다.
                </p>
              </div>
            </div>

            {/* 카드 3: 실시간 대시보드 */}
            <div className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 h-44 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {/* 대시보드 일러스트 */}
                <div className="w-52 px-3">
                  <div className="bg-white/15 border border-white/30 rounded-xl p-2.5 mb-2">
                    {/* 지도 대체 그리드 */}
                    <div className="h-16 bg-white/10 rounded-lg mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-5 grid-rows-3">
                        {Array.from({length:15}).map((_,i) => (
                          <div key={i} className="border border-white/10" />
                        ))}
                      </div>
                      {/* 핀 */}
                      {[[20,30],[50,50],[75,25]].map(([x,y],i) => (
                        <div key={i} className="absolute w-3 h-3 bg-white rounded-full shadow"
                          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }} />
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      {['전체 8','아파트 3','오피스텔 3','주택 2'].map((t,i) => (
                        <span key={i} className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          i===0 ? 'bg-white text-emerald-700' : 'bg-white/20 text-white'
                        }`}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-7">
                <span className="text-[11px] font-black text-emerald-600 tracking-[0.2em] uppercase">Feature 03</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2 mb-3 leading-snug">
                  실시간 대시보드<br />
                  <span className="text-emerald-600">매물 현황 한눈에</span>
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  오늘 임장한 매물 전체를 지도와 목록으로 한 화면에. PC와 모바일이 실시간 동기화되어 언제 어디서나 최신 정보를 확인합니다.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 · 가성비 강조 (저울 비교)
      ══════════════════════════════════════ */}
      <section className="bg-[#050d1f] py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">가격 비교</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            커피 한 잔 값으로<br />
            <span className="text-amber-400">프로 중개사</span>가 되세요
          </h2>
          <p className="text-slate-400 text-base mb-16">월 4,500원, 하루 150원이면 충분합니다</p>

          {/* 저울 비교 */}
          <div className="flex items-end justify-center gap-6 sm:gap-12 mb-14">
            {/* 커피 쪽 (가벼움) */}
            <div className="flex flex-col items-center gap-4">
              <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 sm:p-8 w-32 sm:w-44 flex flex-col items-center gap-3">
                <div className="text-4xl sm:text-5xl">☕</div>
                <div>
                  <p className="text-white font-bold text-sm sm:text-base text-center">커피 한 잔</p>
                  <p className="text-slate-400 text-xs text-center mt-1">4,500원</p>
                </div>
              </div>
              <div className="text-slate-600 text-xs font-bold uppercase tracking-wider">하루 지출</div>
            </div>

            {/* 저울대 */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-0.5 h-20 bg-gradient-to-b from-slate-600 to-slate-700" />
              <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700" />
              <div className="text-slate-500 text-xs mt-2">VS</div>
            </div>

            {/* 임장메이트 쪽 (무거움 = 가치 있음) */}
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600/30 to-blue-800/30 border-2 border-blue-500/60 rounded-3xl p-6 sm:p-8 w-32 sm:w-44 flex flex-col items-center gap-3 shadow-2xl shadow-blue-900/50">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-700/50">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="4" y="2" width="16" height="20" rx="2"/>
                    <path d="M9 22v-4h6v4"/>
                    <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-black text-sm sm:text-base text-center">임장메이트 PRO</p>
                  <p className="text-amber-400 font-bold text-center mt-1">연 55,000원</p>
                  <p className="text-slate-400 text-[10px] text-center">= 하루 150원</p>
                </div>
              </div>
              <div className="text-blue-400 text-xs font-bold uppercase tracking-wider">1년 전체</div>
            </div>
          </div>

          {/* 혜택 리스트 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
            {[
              { icon: '🔒', title: '기기 보안', desc: 'PC 1대 + 모바일 1대 등록 보안' },
              { icon: '☁️', title: '클라우드 저장', desc: '매물 데이터 안전하게 무제한 보관' },
              { icon: '📲', title: '즉시 문자 발송', desc: '현장에서 바로 고객 안내문자 전송' },
            ].map((item, i) => (
              <div key={i} className="bg-blue-950/40 border border-blue-800/40 rounded-2xl p-5 text-left">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-white font-bold text-sm mb-1">{item.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 · 신청 폼
      ══════════════════════════════════════ */}
      <section id="apply" className="bg-[#0e2044] py-20 px-5">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">서비스 신청</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
              임장메이트 PRO<br />서비스 신청서
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              아래 정보를 입력하시면 입금 확인 후 최대{' '}
              <span className="text-amber-400 font-bold">1시간 이내</span>로 승인됩니다.
            </p>
            <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-5" />
          </div>

          <ApplicationForm />
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-[#080e1f] border-t border-blue-900/40 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  <path d="M9 22v-4h6v4"/>
                </svg>
              </div>
              <span className="text-white font-bold text-sm">임장메이트 <span className="text-blue-400">PRO</span></span>
              <span className="text-slate-600 text-xs ml-2">v2.0 · Copyright 2026</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <a href="http://pf.kakao.com/_LDfqX/112585347" target="_blank" rel="noopener noreferrer"
                className="hover:text-slate-300 underline underline-offset-2 transition-colors">이용약관</a>
              <span>|</span>
              <a href="http://pf.kakao.com/_LDfqX/112637630" target="_blank" rel="noopener noreferrer"
                className="hover:text-slate-300 underline underline-offset-2 transition-colors">개인정보처리방침</a>
            </div>
          </div>
          <p className="text-slate-600 text-xs text-center sm:text-left leading-relaxed">
            사업자등록번호 224-21-62567 · 경기도 동두천시 송내동665-6 504호 · 대표: 송태영 · 상호: 임장메이트
          </p>
        </div>
      </footer>

    </div>
  );
}
