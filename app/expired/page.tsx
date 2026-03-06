'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';

export default function ExpiredPage() {
  const { firebaseUser, appUser, expiryError, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !appUser) { router.replace('/'); return; }
    // 만료가 아닌 정상 사용자는 대시보드로
    if (!expiryError && appUser.status === 'approved' && appUser.planStatus === '사용중') {
      router.replace('/dashboard');
    }
  }, [loading, firebaseUser, appUser, expiryError, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050d1f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050d1f] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-600/10 rounded-full blur-[100px]" />
      </div>

      {/* 로고 */}
      <div className="relative z-10 flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
          </svg>
        </div>
        <span className="font-bold text-white text-base tracking-tight">임장메이트 <span className="text-blue-400">PRO</span></span>
      </div>

      {/* 카드 */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="px-8 py-9">
          {/* 아이콘 */}
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>

          <h2 className="text-slate-900 font-extrabold text-xl text-center leading-snug mb-3">
            서비스 이용 기간이<br />만료되었습니다
          </h2>
          <p className="text-slate-500 text-sm text-center leading-relaxed mb-6">
            구독을 연장하시려면 아래 버튼을 눌러<br />
            <span className="text-amber-600 font-bold">입금 및 연장 문의</span>를 해주세요.<br />
            확인 후 최대 <strong>1시간 이내</strong> 재활성화됩니다.
          </p>

          {/* 사용자 정보 */}
          {appUser && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mb-6">
              <p className="text-[11px] text-slate-400 mb-1">현재 계정</p>
              <p className="text-slate-800 font-bold text-sm">{appUser.name || appUser.displayName}</p>
              <p className="text-slate-400 text-xs">{appUser.email}</p>
              {appUser.expiryDate && (
                <p className="text-red-400 text-xs mt-1 font-semibold">
                  만료일: {new Date(appUser.expiryDate).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
          )}

          {/* 카카오 문의 버튼 */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#f5dc00] active:scale-[.98] text-[#3A1D1D] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-yellow-200 mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3A1D1D">
              <path d="M12 3C6.48 3 2 6.69 2 11.25c0 2.91 1.72 5.48 4.35 7.02l-.87 3.19a.5.5 0 0 0 .74.57l3.73-2.15c.64.09 1.3.14 1.97.14 5.52 0 10-3.69 10-8.25S17.52 3 12 3z"/>
            </svg>
            카카오로 연장 문의하기
          </a>

          <button
            onClick={logout}
            className="w-full py-3 text-slate-400 hover:text-slate-600 text-sm font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      <p className="relative z-10 mt-6 text-blue-900/60 text-xs">
        연장 승인 완료 시 자동으로 서비스가 재시작됩니다
      </p>
    </div>
  );
}
