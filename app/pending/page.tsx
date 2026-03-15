'use client';

import { useAuth } from '@/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingPage() {
  const { firebaseUser, appUser, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) { router.replace('/'); return; }
    if (appUser?.status === 'approved') router.replace('/dashboard');
    if (appUser?.status === 'rejected') router.replace('/');
  }, [loading, firebaseUser, appUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050d1f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050d1f] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* 배경 블러 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      {/* 로고 */}
      <div className="relative z-10 flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
          </svg>
        </div>
        <span className="font-bold text-white text-base tracking-tight">소장노트 <span className="text-blue-400">PRO</span></span>
      </div>

      {/* 카드 */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700" />

        <div className="px-8 py-9">
          {/* 아이콘 */}
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>

          {/* 메인 카피 */}
          <h2 className="text-slate-900 font-extrabold text-xl text-center leading-snug mb-3">
            반갑습니다!<br />소장노트 PRO의<br />승인을 기다리고 있습니다.
          </h2>

          {/* 서브 카피 */}
          <p className="text-slate-500 text-sm text-center leading-relaxed mb-6">
            입금 확인 후 최대 <span className="text-blue-600 font-bold">1시간 이내</span>에 승인됩니다.<br />
            빠른 승인을 원하시면 아래 버튼을 눌러주세요.
          </p>

          {/* 유저 정보 박스 */}
          {firebaseUser && (
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
          )}

          {/* 카카오 문의 버튼 */}
          <a
            href="http://pf.kakao.com/_LDfqX/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#f5dc00] active:scale-[.98] text-[#3A1D1D] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-yellow-200 mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3A1D1D">
              <path d="M12 3C6.48 3 2 6.69 2 11.25c0 2.91 1.72 5.48 4.35 7.02l-.87 3.19a.5.5 0 0 0 .74.57l3.73-2.15c.64.09 1.3.14 1.97.14 5.52 0 10-3.69 10-8.25S17.52 3 12 3z"/>
            </svg>
            카카오로 빠른 승인 문의
          </a>

          {/* 로그아웃 버튼 */}
          <button
            onClick={logout}
            className="w-full py-3 text-slate-400 hover:text-slate-600 text-sm font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
          >
            승인 완료 후 로그인
          </button>
          <p className="text-slate-400 text-xs text-center mt-2 leading-relaxed">
            카카오 문의 후 승인이 완료되면 다시 로그인해주세요.
          </p>
        </div>
      </div>

      <p className="relative z-10 mt-6 text-blue-900/60 text-xs">
        승인 완료 시 자동으로 서비스가 시작됩니다
      </p>
    </div>
  );
}
