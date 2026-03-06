'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';
import {
  subscribeAllUsers, updateUserStatus, revokeDevice, approveOneYear,
} from '@/auth/userStore';
import { subscribeApplications, updateApplicationStatus } from '@/lib/firestore';
import { AppUser, ApplicationForm, UserStatus } from '@/types';
import { cn } from '@/lib/utils';

function planBadge(u: AppUser) {
  const now = Date.now();
  const expired = u.expiryDate != null && u.expiryDate < now;
  if (expired)                       return { label: '만료',    cls: 'bg-red-500/15 text-red-300 border-red-500/30' };
  if (u.planStatus === '사용중')     return { label: '사용중',  cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
  return                                    { label: '승인대기', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
}

export default function AdminPage() {
  const { firebaseUser, isAdmin, loading, logout } = useAuth();
  const router = useRouter();

  const [mainTab,      setMainTab]      = useState<'users' | 'applications'>('users');
  const [users,        setUsers]        = useState<AppUser[]>([]);
  const [applications, setApplications] = useState<ApplicationForm[]>([]);
  const [filter,       setFilter]       = useState<UserStatus | 'all'>('pending');
  const [busy,         setBusy]         = useState<Record<string, boolean>>({});

  // 이중 검증: AuthContext isAdmin + 이메일 직접 확인
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const isVerifiedAdmin = isAdmin && adminEmails.includes((firebaseUser?.email ?? '').toLowerCase());

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !isVerifiedAdmin) { router.replace('/'); return; }

    const unsubUsers = subscribeAllUsers(setUsers);
    const unsubApps  = subscribeApplications(setApplications);
    return () => { unsubUsers(); unsubApps(); };
  }, [loading, firebaseUser, isVerifiedAdmin, router]);

  async function handleStatus(uid: string, status: 'approved' | 'rejected') {
    setBusy(b => ({ ...b, [uid]: true }));
    await updateUserStatus(uid, status);
    setBusy(b => ({ ...b, [uid]: false }));
  }

  async function handleApproveOneYear(uid: string) {
    const key = `year_${uid}`;
    setBusy(b => ({ ...b, [key]: true }));
    await approveOneYear(uid);
    setBusy(b => ({ ...b, [key]: false }));
  }

  async function handleRevokeDevice(uid: string, deviceId: string) {
    const key = `${uid}_${deviceId}`;
    setBusy(b => ({ ...b, [key]: true }));
    await revokeDevice(uid, deviceId);
    setBusy(b => ({ ...b, [key]: false }));
  }

  async function handleAppStatus(id: string, status: '신청완료' | '처리완료') {
    const key = `app_${id}`;
    setBusy(b => ({ ...b, [key]: true }));
    await updateApplicationStatus(id, status);
    setBusy(b => ({ ...b, [key]: false }));
  }

  const filtered = filter === 'all' ? users : users.filter(u => u.status === filter);
  const counts = {
    pending:  users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
    all:      users.length,
  };
  const appNew = applications.filter(a => a.status === '신청완료').length;

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-400 text-sm">관리자 패널 로딩 중...</p>
      </div>
    </div>
  );

  if (!isVerifiedAdmin) return null;

  const USER_TABS: [UserStatus | 'all', string, string][] = [
    ['pending',  '대기중',  'text-amber-400  bg-amber-400/10  border-amber-400/30  data-[active=true]:bg-amber-500  data-[active=true]:text-white  data-[active=true]:border-amber-500'],
    ['approved', '승인됨',  'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 data-[active=true]:bg-emerald-600 data-[active=true]:text-white data-[active=true]:border-emerald-600'],
    ['rejected', '거부됨',  'text-red-400    bg-red-400/10    border-red-400/30    data-[active=true]:bg-red-600    data-[active=true]:text-white    data-[active=true]:border-red-600'],
    ['all',      '전체',    'text-blue-400   bg-blue-400/10   border-blue-400/30   data-[active=true]:bg-blue-600   data-[active=true]:text-white   data-[active=true]:border-blue-600'],
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">

      {/* ── 헤더 ── */}
      <header className="border-b border-blue-900/60 bg-[#0d1426]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-white leading-none">관리자 패널</p>
              <p className="text-[11px] text-blue-400 mt-0.5">ImjangMate PRO</p>
            </div>
            <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full px-2.5 py-0.5">
              슈퍼어드민
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-500/10">
              ← 앱으로
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">

        {/* ── 통계 카드 ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {([
            { label: '전체 회원',   value: counts.all,        color: 'from-blue-600 to-blue-800',       icon: '👥' },
            { label: '승인 대기',   value: counts.pending,    color: 'from-amber-500 to-amber-700',     icon: '⏳' },
            { label: '승인 완료',   value: counts.approved,   color: 'from-emerald-500 to-emerald-700', icon: '✅' },
            { label: '신규 신청서', value: appNew,             color: 'from-orange-500 to-orange-700',   icon: '📋' },
          ] as const).map(({ label, value, color, icon }) => (
            <div key={label} className="bg-[#0d1426] border border-blue-900/40 rounded-2xl p-4 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
              <p className="text-2xl mb-1 relative">{icon}</p>
              <p className="text-2xl font-bold text-white relative">{value}</p>
              <p className="text-xs text-slate-400 relative mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── 메인 탭: 회원 목록 / 신청 목록 ── */}
        <div className="flex gap-2 mb-6">
          <button
            data-active={mainTab === 'users'}
            onClick={() => setMainTab('users')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all text-blue-400 bg-blue-400/10 border-blue-400/30 data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:border-blue-600"
          >
            👥 회원 목록 ({counts.all})
          </button>
          <button
            data-active={mainTab === 'applications'}
            onClick={() => setMainTab('applications')}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold border transition-all text-amber-400 bg-amber-400/10 border-amber-400/30 data-[active=true]:bg-amber-500 data-[active=true]:text-white data-[active=true]:border-amber-500"
          >
            📋 신청 목록 ({applications.length})
            {appNew > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
                {appNew}
              </span>
            )}
          </button>
        </div>

        {/* ── 회원 목록 뷰 ── */}
        {mainTab === 'users' && (
          <>
            {/* 필터 탭 */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {USER_TABS.map(([s, label, cls]) => (
                <button
                  key={s}
                  data-active={filter === s}
                  onClick={() => setFilter(s)}
                  className={cn('px-4 py-2 rounded-xl text-sm font-semibold border transition-all', cls)}
                >
                  {label}
                  <span className="ml-1.5 opacity-70">({counts[s]})</span>
                </button>
              ))}
            </div>

            {/* 사용자 목록 */}
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                  <p className="text-4xl mb-3">🔍</p>
                  <p>해당 상태의 회원이 없습니다</p>
                </div>
              )}

              {filtered.map(u => {
                const isSelf    = firebaseUser?.uid === u.uid;
                const plan      = planBadge(u);
                const now       = Date.now();
                const isExpired = u.expiryDate != null && u.expiryDate < now;

                return (
                  <div key={u.uid}
                    className="bg-[#0d1426] border border-blue-900/40 rounded-2xl p-5 hover:border-blue-700/60 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* 아바타 */}
                      {u.photoURL
                        ? <img src={u.photoURL} alt="" className="w-11 h-11 rounded-full flex-shrink-0 ring-2 ring-blue-900" />
                        : (
                          <div className="w-11 h-11 rounded-full flex-shrink-0 bg-blue-900/40 border border-blue-800 flex items-center justify-center text-lg">
                            👤
                          </div>
                        )
                      }

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-bold text-white">{u.name || u.displayName || '이름 없음'}</span>
                          {isSelf && <span className="text-xs text-blue-500 font-semibold">(나)</span>}
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', {
                            'bg-amber-500/15  text-amber-300  border-amber-500/30':    u.status === 'pending',
                            'bg-emerald-500/15 text-emerald-300 border-emerald-500/30': u.status === 'approved',
                            'bg-red-500/15    text-red-300    border-red-500/30':      u.status === 'rejected',
                          })}>
                            {u.status === 'pending' ? '대기' : u.status === 'approved' ? '승인' : '거부'}
                          </span>
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', plan.cls)}>
                            {plan.label}
                          </span>
                        </div>

                        <p className="text-slate-400 text-sm">{u.email}</p>

                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {u.name && (
                            <span className="text-slate-300 text-xs">
                              <span className="text-slate-500">성함: </span>{u.name}
                            </span>
                          )}
                          {u.phone && (
                            <a
                              href={`tel:${u.phone}`}
                              className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                              </svg>
                              {u.phone}
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <p className="text-slate-600 text-xs">
                            가입: {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                          {u.approvedAt && (
                            <p className="text-slate-600 text-xs">
                              승인: {new Date(u.approvedAt).toLocaleDateString('ko-KR')}
                            </p>
                          )}
                          {u.expiryDate && (
                            <p className={cn('text-xs font-semibold', isExpired ? 'text-red-400' : 'text-emerald-400')}>
                              {isExpired
                                ? `⚠ 만료됨 (${new Date(u.expiryDate).toLocaleDateString('ko-KR')})`
                                : `✓ 이용 만료: ${new Date(u.expiryDate).toLocaleDateString('ko-KR')}`}
                            </p>
                          )}
                        </div>

                        {/* 등록 기기 */}
                        {u.devices?.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            <p className="text-[11px] text-blue-500 font-bold uppercase tracking-widest">등록 기기</p>
                            {u.devices.map(d => (
                              <div key={d.deviceId}
                                className="flex items-center gap-3 bg-blue-950/40 border border-blue-900/40 rounded-xl px-3 py-2"
                              >
                                <span className="text-base">{d.deviceType === 'pc' ? '💻' : '📱'}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-white font-semibold">{d.deviceName}</p>
                                  <p className="text-xs text-slate-500">
                                    마지막 접속: {new Date(d.lastLogin).toLocaleDateString('ko-KR')}
                                  </p>
                                </div>
                                <button
                                  disabled={busy[`${u.uid}_${d.deviceId}`]}
                                  onClick={() => handleRevokeDevice(u.uid, d.deviceId)}
                                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 font-semibold px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                  해제
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          disabled={busy[`year_${u.uid}`]}
                          onClick={() => handleApproveOneYear(u.uid)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors shadow shadow-blue-900/50 whitespace-nowrap"
                        >
                          {busy[`year_${u.uid}`] ? '...' : '★ 1년 승인'}
                        </button>

                        {u.status !== 'rejected' && !isSelf && (
                          <button
                            disabled={busy[u.uid]}
                            onClick={() => handleStatus(u.uid, 'rejected')}
                            className="px-4 py-2 bg-[#1a2035] hover:bg-red-700/70 disabled:opacity-40 text-slate-400 hover:text-white text-sm font-bold rounded-xl border border-blue-900/40 hover:border-red-600/60 transition-colors"
                          >
                            {busy[u.uid] ? '...' : '✕ 거부'}
                          </button>
                        )}
                        {u.status === 'rejected' && (
                          <button
                            disabled={busy[u.uid]}
                            onClick={() => handleStatus(u.uid, 'approved')}
                            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-xl border border-slate-600/40 transition-colors"
                          >
                            거부 해제
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── 신청 목록 뷰 ── */}
        {mainTab === 'applications' && (
          <div className="space-y-3">
            {applications.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <p className="text-4xl mb-3">📋</p>
                <p>아직 신청서가 없습니다</p>
              </div>
            )}

            {applications.map(app => (
              <div key={app.id}
                className={cn(
                  'bg-[#0d1426] border rounded-2xl p-5 transition-colors',
                  app.status === '신청완료'
                    ? 'border-amber-500/40 hover:border-amber-400/60'
                    : 'border-blue-900/30 opacity-60 hover:opacity-80'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* 아이콘 */}
                  <div className="w-11 h-11 rounded-full flex-shrink-0 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-lg">
                    📝
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    {/* 이름 + 상태 */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-white text-base">{app.name}</span>
                      <span className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded-full border',
                        app.status === '신청완료'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                      )}>
                        {app.status}
                      </span>
                    </div>

                    {/* 핵심 정보 그리드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs w-16 flex-shrink-0">전화번호</span>
                        <a href={`tel:${app.phone}`} className="text-blue-400 hover:text-blue-300 text-xs font-semibold transition-colors">
                          {app.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs w-16 flex-shrink-0">입금자명</span>
                        <span className="text-white text-xs font-semibold">{app.depositorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs w-16 flex-shrink-0">구글 ID</span>
                        <span className="text-slate-300 text-xs truncate">{app.googleEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs w-16 flex-shrink-0">플랜</span>
                        <span className="text-amber-400 text-xs font-semibold">{app.plan}</span>
                      </div>
                      {app.receiptType !== '없음' && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <span className="text-slate-500 text-xs w-16 flex-shrink-0">증빙</span>
                          <span className="text-slate-300 text-xs">
                            {app.receiptType}
                            {app.receiptInfo && ` · ${app.receiptInfo}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-slate-600 text-xs mt-2">
                      신청일: {new Date(app.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {app.status === '신청완료' ? (
                      <button
                        disabled={busy[`app_${app.id}`]}
                        onClick={() => handleAppStatus(app.id, '처리완료')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                      >
                        {busy[`app_${app.id}`] ? '...' : '✓ 처리완료'}
                      </button>
                    ) : (
                      <button
                        disabled={busy[`app_${app.id}`]}
                        onClick={() => handleAppStatus(app.id, '신청완료')}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-40 text-slate-400 text-xs font-bold rounded-xl border border-slate-600/40 transition-colors whitespace-nowrap"
                      >
                        {busy[`app_${app.id}`] ? '...' : '↩ 되돌리기'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
