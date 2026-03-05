'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardApp from '@/components/DashboardApp';

export default function DashboardPage() {
  const { firebaseUser, appUser, loading, deviceError, expiryError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser)                 { console.log('[대시보드] 이동할 경로: / (비로그인)');       router.replace('/');        return; }
    if (!appUser)                      return;
    if (appUser.status === 'pending')  { console.log('[대시보드] 이동할 경로: / (승인 대기)');      router.replace('/');        return; }
    if (appUser.status === 'rejected') { console.log('[대시보드] 이동할 경로: / (거부된 계정)');    router.replace('/');        return; }
    if (deviceError)                   { console.log('[대시보드] 이동할 경로: / (기기 오류)');      router.replace('/');        return; }
    if (expiryError)                   { console.log('[대시보드] 이동할 경로: /expired (만료)');   router.replace('/expired'); return; }
    console.log('[대시보드] 이동할 경로: /dashboard (정상 진입)');
  }, [loading, firebaseUser, appUser, deviceError, expiryError, router]);

  if (loading || !appUser || appUser.status !== 'approved' || deviceError || expiryError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <DashboardApp />;
}
