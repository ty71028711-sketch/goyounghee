'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useSessionVisits } from './hooks/useSessionVisits';
import { useArchives } from './hooks/useArchives';
import { useBusinessCard } from './hooks/useBusinessCard';
import PropertyCard from './PropertyCard';
import PropertyModal from './PropertyModal';
import SmsComposePage from './SmsComposePage';
import SettingsPage from './SettingsPage';
import ArchivesPage from './ArchivesPage';
import IjangMapPage from './IjangMapPage';
import { Visit } from '@/types';
import { getFormattedDate, cn } from '@/lib/utils';

type Tab  = 'list' | 'sms' | 'archive' | 'map' | 'settings';
type Sort = 'timeAsc' | 'timeDesc' | 'available';

// ── 토스트 타입 ───────────────────────────────────────────────────
interface ToastItem { id: string; visitName: string; message: string; }

/* ── 헤더 ── */
function Header({ isAdmin }: { isAdmin: boolean }) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 justify-between flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-md shadow-brand-200">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
          </svg>
        </div>
        <div>
          <p className="font-extrabold text-[15px] text-slate-900 tracking-tight">임장메이트 <span className="text-brand-500">PRO</span></p>
          <p className="text-[9px] text-slate-400">공인중개사 전용</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <a
            href="/admin"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-bold rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            관리자
          </a>
        )}
        <div className="bg-brand-50 border border-brand-200 rounded-lg px-3 py-1.5 text-[13px] font-bold text-brand-600 tabular-nums">
          {time.toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', hour12:false })}
        </div>
      </div>
    </header>
  );
}

/* ── 바텀 내비 ── */
function BottomNav({ tab, setTab, smsCount }: { tab:Tab; setTab:(t:Tab)=>void; smsCount:number }) {
  const items = [
    {
      id:'list' as Tab, label:'매물 리스트',
      icon:(a:boolean)=>(<svg className={cn('w-6 h-6',a?'text-brand-500':'text-slate-400')} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
    },
    {
      id:'sms' as Tab, label:'문자 전송', badge: smsCount,
      icon:(a:boolean)=>(<svg className={cn('w-6 h-6',a?'text-brand-500':'text-slate-400')} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
    },
    {
      id:'archive' as Tab, label:'보관함',
      icon:(a:boolean)=>(<svg className={cn('w-6 h-6',a?'text-brand-500':'text-slate-400')} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>),
    },
    {
      id:'map' as Tab, label:'임장 지도',
      icon:(a:boolean)=>(<svg className={cn('w-6 h-6',a?'text-brand-500':'text-slate-400')} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
    },
    {
      id:'settings' as Tab, label:'설정',
      icon:(a:boolean)=>(<svg className={cn('w-6 h-6',a?'text-brand-500':'text-slate-400')} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>),
    },
  ];
  return (
    <nav className="bg-white border-t border-slate-200 flex flex-shrink-0 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,.07)]">
      {items.map(({ id, label, icon, badge }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)}
            className={cn('flex-1 flex flex-col items-center gap-1 py-2.5 relative transition-colors', active ? 'text-brand-500' : 'text-slate-400')}>
            {active && <div className="absolute top-0 left-[15%] right-[15%] h-0.5 bg-brand-500 rounded-b" />}
            {(badge ?? 0) > 0 && <span className="absolute top-1.5 right-[12%] w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>}
            {icon(active)}
            <span className={cn('text-[10px]', active ? 'font-bold' : 'font-medium')}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ── 메인 ── */
export default function DashboardApp() {
  const { firebaseUser, isAdmin } = useAuth();
  const { visits, add, update, remove, clear } = useSessionVisits(firebaseUser?.uid);
  const { save: saveToArchive, saving }         = useArchives(firebaseUser?.uid);
  const { card }                                = useBusinessCard(firebaseUser?.uid);

  const [tab,          setTab]          = useState<Tab>('list');
  const [sortMode,     setSortMode]     = useState<Sort>('timeAsc');
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [showModal,    setShowModal]    = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [toasts,       setToasts]       = useState<ToastItem[]>([]);

  // ── 토스트 표시 ────────────────────────────────────────────────
  function showToast(visitName: string, message: string) {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, visitName, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
  }

  function dismissToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  // ── CustomEvent 리스너 (PropertyCard → DashboardApp 알림 전달) ─
  useEffect(() => {
    function handler(e: Event) {
      const { visitName, message } = (e as CustomEvent<{visitName:string; message:string}>).detail;
      showToast(visitName, message);
    }
    window.addEventListener('visit-toast', handler);
    return () => window.removeEventListener('visit-toast', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 글로벌 알림 체크 (30초 간격, 정각 ±30초 이내 발동) ────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const ALARMS = [60, 30];

    function checkAlarms() {
      const now = new Date();
      visits.forEach(v => {
        if (!v.visitTime) return;
        if (v.appointmentStatus === '방문완료' || v.appointmentStatus === '불가') return;
        if (!localStorage.getItem(`notif_${v.id}`)) return;

        const [h, m] = v.visitTime.split(':').map(Number);
        const visitMs = new Date().setHours(h, m, 0, 0);

        ALARMS.forEach(mins => {
          const alarmMs  = visitMs - mins * 60_000;
          const diff     = alarmMs - now.getTime();
          const firedKey = `notif_fired_${v.id}_${mins}`;

          // 알람 시각이 지났거나(±30s) 아직 발동 안 됨
          if (diff <= 30_000 && diff > -30_000 && !sessionStorage.getItem(firedKey)) {
            sessionStorage.setItem(firedKey, '1');
            const msg = `방문 ${mins}분 전입니다. 준비해 주세요!`;

            if (Notification.permission === 'granted') {
              new Notification(`🏠 ${v.apartmentName}`, {
                body: msg, icon: '/favicon.ico',
              });
            }
            // 인앱 토스트
            showToast(v.apartmentName, msg);
          }
        });
      });
    }

    checkAlarms();
    const id = setInterval(checkAlarms, 30_000);
    return () => clearInterval(id);
  }, [visits]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 정렬 ──────────────────────────────────────────────────────
  const sortedVisits = useMemo(() => [...visits].sort((a, b) => {
    if (sortMode === 'available') {
      const aOk = a.appointmentStatus === '가능' ? 0 : 1;
      const bOk = b.appointmentStatus === '가능' ? 0 : 1;
      if (aOk !== bOk) return aOk - bOk;
    }
    if (!a.visitTime) return 1;
    if (!b.visitTime) return -1;
    return sortMode === 'timeDesc'
      ? b.visitTime.localeCompare(a.visitTime)
      : a.visitTime.localeCompare(b.visitTime);
  }), [visits, sortMode]);

  function toggleSort() {
    setSortMode(m => m === 'timeAsc' ? 'timeDesc' : m === 'timeDesc' ? 'available' : 'timeAsc');
  }

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  function openAdd()         { setEditingVisit(null); setShowModal(true); }
  function openEdit(v:Visit) { setEditingVisit(v);    setShowModal(true); }
  function closeModal()      { setShowModal(false);   setEditingVisit(null); }

  function handleSave(data: Omit<Visit,'id'|'createdAt'|'updatedAt'> & { id?:string }) {
    if (data.id) { update(data as Visit); }
    else         { add(data); }
    closeModal();
  }

  function handleDelete(id: string) {
    remove(id);
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  // ── 보관함 저장 ───────────────────────────────────────────────
  async function handleSaveToArchive() {
    if (visits.length === 0) {
      showToast('알림', '저장할 방문 기록이 없습니다.');
      return;
    }
    const ok = window.confirm(
      `오늘 방문 기록 ${visits.length}건을 보관함에 저장할까요?\n저장 후 현재 목록은 초기화됩니다.`
    );
    if (!ok) return;

    const success = await saveToArchive(visits);
    if (success) {
      clear(visits);
      setSelectedIds(new Set());
      showToast('보관함 저장 완료', `${visits.length}건이 보관함에 저장되었습니다.`);
    } else {
      showToast('저장 실패', '저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  }

  const allSelected = visits.length > 0 && selectedIds.size === visits.length;

  return (
    <div className="max-w-[560px] mx-auto h-[100dvh] flex flex-col bg-slate-50 relative overflow-hidden">
      <Header isAdmin={isAdmin} />

      {/* ── 토스트 컨테이너 ── */}
      <div className="absolute top-16 left-0 right-0 z-[200] flex flex-col gap-2 px-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className="bg-white border border-amber-200 rounded-xl shadow-xl px-4 py-3 flex items-start gap-3 pointer-events-auto animate-slide-up"
          >
            <span className="text-[20px] flex-shrink-0 leading-none mt-0.5">🏠</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-slate-900 truncate">{t.visitName}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{t.message}</p>
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-slate-300 hover:text-slate-500 flex-shrink-0 text-[16px] leading-none">✕</button>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── 리스트 탭 ── */}
        {tab === 'list' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 상단 컨트롤 */}
            <div className="px-4 pt-4 pb-2 flex-shrink-0">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3 h-3 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span className="text-[11px] text-slate-500">{getFormattedDate()}</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-dot" />
                  </div>
                  <h1 className="font-bhs text-[22px] text-slate-900 tracking-tight">매물 안내 리스트</h1>
                </div>
                <div className="flex items-center gap-2">
                  {/* 보관함 저장 버튼 */}
                  {visits.length > 0 && (
                    <button
                      onClick={handleSaveToArchive}
                      disabled={saving}
                      className="no-print flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-300 text-emerald-700 text-[12px] font-bold rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"/><path d="M9 7h6M9 11h6M9 15h4"/>
                      </svg>
                      {saving ? '저장 중...' : '보관함 저장'}
                    </button>
                  )}
                  <button onClick={() => window.print()} className="no-print flex items-center gap-1.5 px-3 py-2 bg-brand-50 border border-brand-200 text-brand-600 text-[12px] font-semibold rounded-xl hover:bg-brand-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    출력
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[12px] text-slate-500">
                  총 <strong className="text-slate-900">{visits.length}</strong>건
                  {selectedIds.size > 0 && <span className="text-blue-600 font-bold ml-2">· {selectedIds.size}건 선택</span>}
                </p>
                <div className="flex gap-2">
                  {visits.length > 0 && (
                    <button
                      onClick={() => setSelectedIds(allSelected ? new Set() : new Set(visits.map(v => v.id)))}
                      className={cn('px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all',
                        allSelected ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500')}
                    >
                      {allSelected ? '✓ 전체해제' : '전체선택'}
                    </button>
                  )}
                  <button onClick={toggleSort}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-500 text-[11px] font-medium rounded-lg hover:border-slate-300 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
                    {sortMode === 'timeAsc' ? '시간순' : sortMode === 'timeDesc' ? '역순' : '방문가능순'}
                  </button>
                </div>
              </div>
            </div>

            {/* 카드 목록 */}
            <div className="flex-1 overflow-y-auto px-3 pb-32">
              {sortedVisits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-center mx-1 mt-2">
                  <svg className="w-10 h-10 text-slate-200 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <p className="text-[14px] text-slate-500 font-medium">오늘의 방문 일정이 비어 있습니다</p>
                  <p className="text-[12px] text-slate-400 mt-1">하단 + 버튼을 눌러 매물을 추가해 주세요</p>
                </div>
              ) : sortedVisits.map((v, i) => (
                <PropertyCard
                  key={v.id} visit={v} index={i}
                  isSelected={selectedIds.has(v.id)}
                  onToggleSelect={toggleSelect}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'sms' && (
          <SmsComposePage
            visits={visits} selectedIds={selectedIds}
            onToggle={toggleSelect} businessCard={card}
            onGoToList={() => setTab('list')}
          />
        )}

        {tab === 'archive'  && <ArchivesPage />}
        {tab === 'map'      && <IjangMapPage />}
        {tab === 'settings' && <SettingsPage />}
      </div>

      <BottomNav tab={tab} setTab={setTab} smsCount={selectedIds.size} />

      {/* + FAB 버튼 */}
      {tab === 'list' && (
        <button onClick={openAdd}
          className="no-print absolute right-4 bottom-20 w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shadow-xl shadow-brand-300 hover:shadow-2xl transition-all active:scale-95 z-40">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      )}

      {/* 매물 등록/수정 모달 */}
      {showModal && (
        <PropertyModal
          initialData={editingVisit ?? undefined}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
