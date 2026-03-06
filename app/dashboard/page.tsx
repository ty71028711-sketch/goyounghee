'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';
import DashboardApp from '@/core/DashboardApp';

export default function DashboardPage() {
  const { firebaseUser, appUser, loading, deviceError, expiryError } = useAuth();
  const router = useRouter();
  // 3초 안전 타임아웃 — AuthContext 로딩이 지연돼도 강제 처리
  const [localTimeout, setLocalTimeout] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLocalTimeout(true), 3_000);
    return () => clearTimeout(t);
  }, []);

  // ── 진단 로그: 매 상태 변경마다 현재 값 출력 ──
  useEffect(() => {
    console.log(
      `[대시보드-진단] loading=${loading} | localTimeout=${localTimeout} | firebaseUser=${firebaseUser?.uid ?? 'null'} | appUser=${appUser ? `${appUser.status}/${appUser.planStatus}` : 'null'} | isReady=${(!loading || localTimeout) && appUser?.status === 'approved'}`
    );
  }, [loading, localTimeout, firebaseUser, appUser]);

  useEffect(() => {
    // loading 중이고 타임아웃도 안 됐으면 대기
    if (loading && !localTimeout) return;
    if (!firebaseUser)                 { console.log('[대시보드] 이동할 경로: / (비로그인)');       router.replace('/');        return; }
    // 타임아웃은 됐지만 loading 아직 진행 중 → appUser가 곧 올 수 있으니 대기
    if (loading)                       return;
    if (!appUser)                      { console.log('[대시보드] 이동할 경로: / (appUser 없음)');   router.replace('/');        return; }
    if (appUser.status === 'pending')  { console.log('[대시보드] 이동할 경로: / (승인 대기)');      router.replace('/');        return; }
    if (appUser.status === 'rejected') { console.log('[대시보드] 이동할 경로: / (거부된 계정)');    router.replace('/');        return; }
    if (deviceError)                   { console.log('[대시보드] 이동할 경로: / (기기 오류)');      router.replace('/');        return; }
    if (expiryError)                   { console.log('[대시보드] 이동할 경로: /expired (만료)');   router.replace('/expired'); return; }
    console.log('[대시보드] 이동할 경로: /dashboard (정상 진입)');
  }, [loading, localTimeout, firebaseUser, appUser, deviceError, expiryError, router]);

  // loading 완료(또는 3초 타임아웃) + approved 상태일 때만 렌더
  const isReady = (!loading || localTimeout) && appUser?.status === 'approved' && !deviceError && !expiryError;

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <DashboardApp />;
}
