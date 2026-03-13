'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';
import { subscribeAllUsers, revokeDevice } from '@/auth/userStore';
import {
  subscribeApplications, updateApplicationStatus, deleteApplication,
  createPreApproval, deletePreApproval,
  adminStartTrial, adminApproveAnnual, adminArchiveUser, adminHardDeleteUser,
} from '@/lib/firestore';
import { AppUser, ApplicationForm } from '@/types';
import { cn } from '@/lib/utils';

type MainTab      = 'applications' | 'members' | 'archived';
type MemberFilter = 'trial' | 'active' | 'expired' | 'all';

/* ── planStatus 분류 헬퍼 (Korean legacy + English 양쪽 처리) ── */
function isTrial(u: AppUser): boolean {
  if (!['trial', '무료체험'].includes(u.planStatus)) return false;
  if (u.expiryDate != null && u.expiryDate < Date.now()) return false;
  return true;
}
function isActive(u: AppUser): boolean {
  if (!['active', '사용중'].includes(u.planStatus)) return false;
  if (u.expiryDate != null && u.expiryDate < Date.now()) return false;
  return true;
}
function isExpiredUser(u: AppUser): boolean {
  if (['expired', 'inactive', '만료', '이용종료'].includes(u.planStatus)) return true;
  if (u.expiryDate != null && u.expiryDate < Date.now()) return true;
  return false;
}

function planBadge(u: AppUser) {
  if (u.status === 'deleted') return { label: '보관함',  cls: 'bg-gray-500/15    text-gray-400    border-gray-500/30' };
  if (isExpiredUser(u))       return { label: '만료',    cls: 'bg-red-500/15     text-red-300     border-red-500/30' };
  if (isTrial(u))             return { label: '무료체험', cls: 'bg-purple-500/15  text-purple-300  border-purple-500/30' };
  if (isActive(u))            return { label: '사용중',  cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
  return                             { label: '대기',    cls: 'bg-amber-500/15   text-amber-300   border-amber-500/30' };
}

export default function AdminPage() {
  const { firebaseUser, isAdmin, loading, logout } = useAuth();
  const router = useRouter();

  const [mainTab,      setMainTab]      = useState<MainTab>('applications');
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('trial');
  const [users,        setUsers]        = useState<AppUser[]>([]);
  const [applications, setApplications] = useState<ApplicationForm[]>([]);
  const [busy,         setBusy]         = useState<Record<string, boolean>>({});

  const adminEmails    = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const isVerifiedAdmin = isAdmin && adminEmails.includes((firebaseUser?.email ?? '').toLowerCase());

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !isVerifiedAdmin) { router.replace('/'); return; }
    const unsubUsers = subscribeAllUsers(setUsers);
    const unsubApps  = subscribeApplications(setApplications);
    return () => { unsubUsers(); unsubApps(); };
  }, [loading, firebaseUser, isVerifiedAdmin, router]);

  /* ─── 신청관리 핸들러 ─── */

  async function handleApprovePlan(app: ApplicationForm, plan: '7일' | '1년') {
    const key       = `approve_${app.id}_${plan}`;
    const days      = plan === '7일' ? 7 : 365;
    const planLabel = plan === '7일' ? '7일 무료체험' : '1년 구독';
    const matched   = users.find(u => u.email.toLowerCase() === app.googleEmail.toLowerCase());

    setBusy(b => ({ ...b, [key]: true }));
    try {
      if (matched) {
        if (plan === '7일') await adminStartTrial(matched.uid);
        else                await adminApproveAnnual(matched.uid);
        await updateApplicationStatus(app.id, '처리완료');
      } else {
        // 미로그인 사용자 → 사전 승인 등록 (로그인 시 자동 활성화)
        await createPreApproval(app.googleEmail, app.name, app.phone, days, planLabel);
        await updateApplicationStatus(app.id, '사전승인');
      }
    } catch (e) {
      console.error('[Admin] 승인 오류:', e);
      alert(`승인 처리 중 오류가 발생했습니다.\n${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(b => ({ ...b, [key]: false }));
    }
  }

  async function handleDeleteApp(id: string) {
    if (!confirm('이 신청서를 삭제할까요?')) return;
    const key = `delapp_${id}`;
    setBusy(b => ({ ...b, [key]: true }));
    try {
      await deleteApplication(id);
    } catch (e) {
      console.error('[Admin] 신청서 삭제 오류:', e);
      alert(`삭제 중 오류가 발생했습니다.\n${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(b => ({ ...b, [key]: false }));
    }
  }

  async function handleRevertApp(app: ApplicationForm) {
    if (!confirm('신청완료 상태로 되돌릴까요?')) return;
    const key = `revert_${app.id}`;
    setBusy(b => ({ ...b, [key]: true }));
    try {
      if (app.status === '사전승인') {
        const matched = users.find(u => u.email.toLowerCase() === app.googleEmail.toLowerCase());
        if (!matched) await deletePreApproval(app.googleEmail);
      }
      await updateApplicationStatus(app.id, '신청완료');
    } catch (e) {
      console.error('[Admin] 되돌리기 오류:', e);
      alert(`오류가 발생했습니다.\n${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(b => ({ ...b, [key]: false }));
    }
  }

  /* ─── 회원관리 핸들러 ─── */

  async function handleRevokeDevice(uid: string, deviceId: string) {
    const key = `device_${uid}_${deviceId}`;
    setBusy(b => ({ ...b, [key]: true }));
    try {
      await revokeDevice(uid, deviceId);
    } catch (e) {
      console.error('[Admin] 기기 해제 오류:', e);
      alert(`기기 해제에 실패했습니다.\n${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(b => ({ ...b, [key]: false }));
    }
  }

  async function handleReapprove(uid: string) {
    const key = `reapprove_${uid}`;
    setBusy(b => ({ ...b, [key]: true }));
    try {
      await adminApproveAnnual(uid);
    } catch (e) {
      console.error('[Admin] 재승인 오류:', e);
      alert(`재승인에 실패했습니다.\n${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(b => ({ ...b, [key]: false }));
    }
  }

  async function handleArchive(uid: string) {
    if (!confirm('보관함으로 이동하시겠습니까?\n데이터는 유지됩니다.')) return;
    const key = `archive_${uid}`;
    setBusy(b => ({ ...b, [key]: true }));
    try {
      await adminArchiveUser(uid);
    } catch (e) {
      console.error('[Admin] 보관함 이동 오류:', e);
      alert(`이동에 실패했습니다.\n${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(b => ({ ...b, [key]: false }));
    }
  }

  /* ─── 보관함 핸들러 ─── */

  async function handleHardDelete(uid: string) {
    if (!confirm('완전 삭제하면 복구할 수 없습니다.\n정말 삭제하시겠습니까?')) return;
    if (!confirm('⚠️ 마지막 확인: 이 작업은 되돌릴 수 없습니다.')) return;
    const key = `harddelete_${uid}`;
    setBusy(b => ({ ...b, [key]: true }));
    try {
      await adminHardDeleteUser(uid);
    } catch (e) {
      console.error('[Admin] 완전 삭제 오류:', e);
      alert(`완전 삭제에 실패했습니다.\n${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(b => ({ ...b, [key]: false }));
    }
  }

  /* ─── 데이터 분류 ─── */
  const pendingApps     = applications.filter(a => a.status === '신청완료');
  const preApprovedApps = applications.filter(a => a.status === '사전승인');
  const approvedUsers   = users.filter(u => u.status === 'approved');
  const archivedUsers   = users.filter(u => u.status === 'deleted');

  const membersMap: Record<MemberFilter, AppUser[]> = {
    trial:   approvedUsers.filter(isTrial),
    active:  approvedUsers.filter(isActive),
    expired: approvedUsers.filter(isExpiredUser),
    all:     approvedUsers,
  };
  const filteredMembers = membersMap[memberFilter];

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-400 text-sm">관리자 패널 로딩 중...</p>
      </div>
    </div>
  );

  if (!isVerifiedAdmin) return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-400 text-sm">리다이렉트 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">

      {/* 헤더 */}
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
              <p className="text-[11px] text-blue-400 mt-0.5">소장노트 PRO</p>
            </div>
            <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full px-2.5 py-0.5">슈퍼어드민</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-500/10">
              ← 앱으로
            </a>
            <button onClick={logout} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: '신규 신청',  value: pendingApps.length,       color: 'from-amber-500   to-amber-700',    icon: '📋' },
            { label: '무료체험중', value: membersMap.trial.length,   color: 'from-purple-500  to-purple-700',   icon: '🎁' },
            { label: '유료회원',   value: membersMap.active.length,  color: 'from-emerald-500 to-emerald-700',  icon: '⭐' },
            { label: '만료회원',   value: membersMap.expired.length, color: 'from-red-500     to-red-700',      icon: '⚠' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-[#0d1426] border border-blue-900/40 rounded-2xl p-4 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
              <p className="text-2xl mb-1 relative">{icon}</p>
              <p className="text-2xl font-bold text-white relative">{value}</p>
              <p className="text-xs text-slate-400 relative mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* 메인 탭 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            data-active={mainTab === 'applications'}
            onClick={() => setMainTab('applications')}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold border transition-all text-amber-400 bg-amber-400/10 border-amber-400/30 data-[active=true]:bg-amber-500 data-[active=true]:text-white data-[active=true]:border-amber-500"
          >
            📋 신청관리
            {pendingApps.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
                {pendingApps.length}
              </span>
            )}
          </button>
          <button
            data-active={mainTab === 'members'}
            onClick={() => setMainTab('members')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all text-blue-400 bg-blue-400/10 border-blue-400/30 data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:border-blue-600"
          >
            👥 회원관리 ({approvedUsers.length})
          </button>
          <button
            data-active={mainTab === 'archived'}
            onClick={() => setMainTab('archived')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all text-gray-400 bg-gray-400/10 border-gray-400/30 data-[active=true]:bg-gray-600 data-[active=true]:text-white data-[active=true]:border-gray-600"
          >
            🗂 보관함 ({archivedUsers.length})
          </button>
        </div>

        {/* ─── 신청관리 ─── */}
        {mainTab === 'applications' && (
          <div className="space-y-3">
            {pendingApps.length === 0 && preApprovedApps.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <p className="text-4xl mb-3">📋</p>
                <p>처리 대기 중인 신청서가 없습니다</p>
              </div>
            )}

            {pendingApps.map(app => {
              const matched = users.find(u => u.email.toLowerCase() === app.googleEmail.toLowerCase());
              return (
                <div key={app.id} className="bg-[#0d1426] border border-amber-500/40 hover:border-amber-400/60 rounded-2xl p-5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full flex-shrink-0 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-lg">📝</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-white text-base">{app.name}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-amber-500/15 text-amber-300 border-amber-500/30">신청완료</span>
                        {matched
                          ? <span className="text-xs text-emerald-400 font-semibold">✓ 계정 있음</span>
                          : <span className="text-xs text-slate-500">미로그인 → 사전 승인 등록</span>
                        }
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs w-16 flex-shrink-0">전화번호</span>
                          <a href={`tel:${app.phone}`} className="text-blue-400 hover:text-blue-300 text-xs font-semibold">{app.phone}</a>
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
                            <span className="text-slate-300 text-xs">{app.receiptType}{app.receiptInfo && ` · ${app.receiptInfo}`}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-600 text-xs mt-2">신청일: {new Date(app.createdAt).toLocaleString('ko-KR')}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        disabled={busy[`approve_${app.id}_7일`]}
                        onClick={() => handleApprovePlan(app, '7일')}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                      >
                        {busy[`approve_${app.id}_7일`] ? '...' : '🎁 7일 체험'}
                      </button>
                      <button
                        disabled={busy[`approve_${app.id}_1년`]}
                        onClick={() => handleApprovePlan(app, '1년')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                      >
                        {busy[`approve_${app.id}_1년`] ? '...' : '⭐ 1년 승인'}
                      </button>
                      <button
                        disabled={busy[`delapp_${app.id}`]}
                        onClick={() => handleDeleteApp(app.id)}
                        className="px-4 py-2 bg-[#1a2035] hover:bg-red-700/70 disabled:opacity-40 text-slate-400 hover:text-white text-xs font-bold rounded-xl border border-blue-900/40 hover:border-red-600/60 transition-colors whitespace-nowrap"
                      >
                        {busy[`delapp_${app.id}`] ? '...' : '✕ 삭제'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 사전 승인 대기 */}
            {preApprovedApps.length > 0 && (
              <>
                <div className="border-t border-blue-900/30 pt-4 mt-4">
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-3">
                    🔑 사전 승인 대기 ({preApprovedApps.length}) — 로그인 시 자동 활성화
                  </p>
                </div>
                {preApprovedApps.map(app => (
                  <div key={app.id} className="bg-[#0d1426] border border-blue-500/30 rounded-2xl p-5 opacity-80">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full flex-shrink-0 bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-lg">🔑</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-white text-base">{app.name}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-blue-500/15 text-blue-300 border-blue-500/30">사전승인</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs w-16 flex-shrink-0">전화번호</span>
                            <a href={`tel:${app.phone}`} className="text-blue-400 text-xs font-semibold">{app.phone}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs w-16 flex-shrink-0">구글 ID</span>
                            <span className="text-slate-300 text-xs truncate">{app.googleEmail}</span>
                          </div>
                        </div>
                        <p className="text-slate-600 text-xs mt-2">신청일: {new Date(app.createdAt).toLocaleString('ko-KR')}</p>
                      </div>
                      <button
                        disabled={busy[`revert_${app.id}`]}
                        onClick={() => handleRevertApp(app)}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-xl border border-slate-600/40 transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        {busy[`revert_${app.id}`] ? '...' : '↩ 되돌리기'}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ─── 회원관리 ─── */}
        {mainTab === 'members' && (
          <>
            <div className="flex gap-2 mb-5 flex-wrap">
              {([
                ['trial',   '무료체험중', 'text-purple-400  bg-purple-400/10  border-purple-400/30  data-[active=true]:bg-purple-600  data-[active=true]:text-white data-[active=true]:border-purple-600'],
                ['active',  '유료회원',   'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 data-[active=true]:bg-emerald-600 data-[active=true]:text-white data-[active=true]:border-emerald-600'],
                ['expired', '만료회원',   'text-red-400     bg-red-400/10     border-red-400/30     data-[active=true]:bg-red-600     data-[active=true]:text-white data-[active=true]:border-red-600'],
                ['all',     '전체',       'text-blue-400    bg-blue-400/10    border-blue-400/30    data-[active=true]:bg-blue-600    data-[active=true]:text-white data-[active=true]:border-blue-600'],
              ] as [MemberFilter, string, string][]).map(([s, label, cls]) => (
                <button
                  key={s}
                  data-active={memberFilter === s}
                  onClick={() => setMemberFilter(s)}
                  className={cn('px-4 py-2 rounded-xl text-sm font-semibold border transition-all', cls)}
                >
                  {label}
                  <span className="ml-1.5 opacity-70">({membersMap[s].length})</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredMembers.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                  <p className="text-4xl mb-3">👥</p>
                  <p>해당 상태의 회원이 없습니다</p>
                </div>
              )}

              {filteredMembers.map(u => {
                const isSelf = firebaseUser?.uid === u.uid;
                const badge  = planBadge(u);
                const exp    = isExpiredUser(u);
                const trial  = isTrial(u);

                return (
                  <div key={u.uid} className="bg-[#0d1426] border border-blue-900/40 rounded-2xl p-5 hover:border-blue-700/60 transition-colors">
                    <div className="flex items-start gap-4">
                      {u.photoURL
                        ? <img src={u.photoURL} alt="" className="w-11 h-11 rounded-full flex-shrink-0 ring-2 ring-blue-900" />
                        : <div className="w-11 h-11 rounded-full flex-shrink-0 bg-blue-900/40 border border-blue-800 flex items-center justify-center text-lg">👤</div>
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-bold text-white">{u.name || u.displayName || '이름 없음'}</span>
                          {isSelf && <span className="text-xs text-blue-500 font-semibold">(나)</span>}
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', badge.cls)}>{badge.label}</span>
                        </div>
                        <p className="text-slate-400 text-sm">{u.email}</p>
                        {u.phone && (
                          <a href={`tel:${u.phone}`} className="text-blue-400 hover:text-blue-300 text-xs font-semibold mt-0.5 inline-block">📞 {u.phone}</a>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {u.approvedAt && (
                            <p className="text-slate-600 text-xs">
                              {trial ? '체험 시작' : '승인'}: {new Date(u.approvedAt).toLocaleDateString('ko-KR')}
                            </p>
                          )}
                          {u.expiryDate && (
                            <p className={cn('text-xs font-semibold', exp ? 'text-red-400' : trial ? 'text-purple-400' : 'text-emerald-400')}>
                              {exp
                                ? `⚠ 만료됨 (${new Date(u.expiryDate).toLocaleDateString('ko-KR')})`
                                : trial
                                  ? `🎁 체험 종료: ${new Date(u.expiryDate).toLocaleDateString('ko-KR')}`
                                  : `✓ 이용 만료: ${new Date(u.expiryDate).toLocaleDateString('ko-KR')}`
                              }
                            </p>
                          )}
                        </div>

                        {u.devices?.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            <p className="text-[11px] text-blue-500 font-bold uppercase tracking-widest">등록 기기</p>
                            {u.devices.map(d => (
                              <div key={d.deviceId} className="flex items-center gap-3 bg-blue-950/40 border border-blue-900/40 rounded-xl px-3 py-2">
                                <span className="text-base">{d.deviceType === 'pc' ? '💻' : '📱'}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-white font-semibold">{d.deviceName}</p>
                                  <p className="text-xs text-slate-500">마지막 접속: {new Date(d.lastLogin).toLocaleDateString('ko-KR')}</p>
                                </div>
                                <button
                                  disabled={busy[`device_${u.uid}_${d.deviceId}`]}
                                  onClick={() => handleRevokeDevice(u.uid, d.deviceId)}
                                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 font-semibold px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                                >해제</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {exp && (
                          <button
                            disabled={busy[`reapprove_${u.uid}`]}
                            onClick={() => handleReapprove(u.uid)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                          >
                            {busy[`reapprove_${u.uid}`] ? '...' : '⭐ 1년 재승인'}
                          </button>
                        )}
                        {!isSelf && (
                          <button
                            disabled={busy[`archive_${u.uid}`]}
                            onClick={() => handleArchive(u.uid)}
                            className="px-4 py-2 bg-[#1a2035] hover:bg-slate-700 disabled:opacity-40 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl border border-slate-700/40 transition-colors whitespace-nowrap"
                          >
                            {busy[`archive_${u.uid}`] ? '...' : '🗂 보관함으로'}
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

        {/* ─── 보관함 ─── */}
        {mainTab === 'archived' && (
          <div className="space-y-3">
            {archivedUsers.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <p className="text-4xl mb-3">🗂</p>
                <p>보관함이 비어 있습니다</p>
              </div>
            )}
            {archivedUsers.map(u => (
              <div key={u.uid} className="bg-[#0d1426] border border-gray-700/40 rounded-2xl p-5 hover:border-gray-600/60 transition-colors opacity-80">
                <div className="flex items-start gap-4">
                  {u.photoURL
                    ? <img src={u.photoURL} alt="" className="w-11 h-11 rounded-full flex-shrink-0 ring-2 ring-gray-800 opacity-60" />
                    : <div className="w-11 h-11 rounded-full flex-shrink-0 bg-gray-900/60 border border-gray-700 flex items-center justify-center text-lg">👤</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-bold text-gray-300">{u.name || u.displayName || '이름 없음'}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-gray-500/15 text-gray-400 border-gray-500/30">보관함</span>
                    </div>
                    <p className="text-slate-500 text-sm">{u.email}</p>
                    {u.phone && <p className="text-slate-600 text-xs mt-0.5">📞 {u.phone}</p>}
                    {(u.archivedAt ?? u.deletedAt) && (
                      <p className="text-slate-600 text-xs mt-1">
                        보관됨: {new Date((u.archivedAt ?? u.deletedAt)!).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      disabled={busy[`harddelete_${u.uid}`]}
                      onClick={() => handleHardDelete(u.uid)}
                      className="px-4 py-2 bg-red-900/50 hover:bg-red-800/70 disabled:opacity-40 text-red-300 text-xs font-bold rounded-xl border border-red-700/40 transition-colors whitespace-nowrap"
                    >
                      {busy[`harddelete_${u.uid}`] ? '...' : '💀 완전 삭제'}
                    </button>
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
