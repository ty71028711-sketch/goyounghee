'use client';

import { useState, useEffect } from 'react';
import { Visit, DEAL_LABELS } from '@/types';
import { getPriceText, formatMan, cn } from '@/lib/utils';

function statusStyle(s: string) {
  if (s === '가능')    return { dot:'bg-emerald-400', text:'text-emerald-600', bg:'bg-emerald-50',   border:'border-emerald-200' };
  if (s === '확인중')  return { dot:'bg-amber-400',   text:'text-amber-600',   bg:'bg-amber-50',     border:'border-amber-200'   };
  if (s === '방문완료')return { dot:'bg-blue-400',    text:'text-blue-600',    bg:'bg-blue-50',      border:'border-blue-200'    };
  return                       { dot:'bg-red-400',     text:'text-red-600',     bg:'bg-red-50',       border:'border-red-200'     };
}

interface Props {
  visit:          Visit;
  index:          number;
  isSelected:     boolean;
  onToggleSelect: (id: string) => void;
  onEdit:         (v: Visit)   => void;
  onDelete:       (id: string) => void;
}

export default function PropertyCard({ visit, index, isSelected, onToggleSelect, onEdit, onDelete }: Props) {
  const [confirmDel,   setConfirmDel]   = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  // localStorage 플래그 복원
  useEffect(() => {
    setNotifEnabled(!!localStorage.getItem(`notif_${visit.id}`));
  }, [visit.id]);

  // ── 알림 토글 ────────────────────────────────────────────────
  async function handleToggleNotif() {
    if (!visit.visitTime) return;

    if (notifEnabled) {
      // OFF: 플래그 제거
      localStorage.removeItem(`notif_${visit.id}`);
      [60, 30].forEach(m => sessionStorage.removeItem(`notif_fired_${visit.id}_${m}`));
      setNotifEnabled(false);
      return;
    }

    // ON: 브라우저 권한 요청 후 플래그 저장
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      alert('알림 권한을 허용해 주세요.\n브라우저 주소창 왼쪽 자물쇠 → 알림 허용');
      return;
    }

    // 방문 시간이 이미 지났는지 확인
    const [h, m] = visit.visitTime.split(':').map(Number);
    const visitMs = new Date().setHours(h, m, 0, 0);
    if (visitMs - 30 * 60_000 < Date.now()) {
      alert('방문 시간이 30분 이내이거나 이미 지났습니다.');
      return;
    }

    localStorage.setItem(`notif_${visit.id}`, '1');
    setNotifEnabled(true);
  }

  // ── 렌더링 ────────────────────────────────────────────────────
  const ss      = statusStyle(visit.appointmentStatus);
  const price   = getPriceText(visit);
  const isHouse = visit.category === 'house';
  const isSale  = visit.dealType === 'saleRight';

  const dealLabel = visit.dealType === 'rental'
    ? (visit.rentalType === 'monthly' ? '월세' : '전세')
    : (DEAL_LABELS[visit.dealType] || '');

  function handleDel() {
    if (confirmDel) { onDelete(visit.id); }
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); }
  }

  const topColor = visit.appointmentStatus === '가능'     ? '#10b981'
                 : visit.appointmentStatus === '확인중'   ? '#f59e0b'
                 : visit.appointmentStatus === '방문완료' ? '#3b82f6'
                 : '#ef4444';

  // 알림 버튼 표시 조건: 방문 시간 있고 + 가능/확인중 상태
  const canNotif = visit.visitTime &&
    (visit.appointmentStatus === '가능' || visit.appointmentStatus === '확인중');

  return (
    <div
      className={cn(
        'animate-slide-up bg-white rounded-2xl overflow-hidden transition-shadow duration-200 mb-3',
        isSelected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-100' : 'shadow-sm hover:shadow-md'
      )}
      style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
    >
      {/* 상태 색상 바 */}
      <div className="h-1" style={{ background: topColor }} />

      <div className="px-4 py-3.5">
        {/* Top row */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          {/* 선택 체크 */}
          <button
            onClick={() => onToggleSelect(visit.id)}
            className={cn(
              'w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
              isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
            )}
          >
            {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
          </button>

          {/* 상태 배지 */}
          <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border', ss.bg, ss.text, ss.border)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', ss.dot)} />
            {visit.appointmentStatus}
          </span>

          {/* 거래유형 */}
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5">{dealLabel}</span>

          {/* 카테고리 배지 */}
          {visit.category === 'sale'  && <span className="text-[10px] font-bold text-violet-600 bg-violet-50 rounded-md px-2 py-0.5">분양권</span>}
          {isHouse                    && <span className="text-[10px] font-bold text-amber-600  bg-amber-50  rounded-md px-2 py-0.5">주택</span>}
          {visit.isVacant             && <span className="text-[10px] font-bold text-white       bg-emerald-500 rounded-md px-2 py-0.5">공실</span>}

          {/* 네이버 부동산 링크 */}
          {visit.naverUrl && (
            <a
              href={visit.naverUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-[#03c75a] hover:bg-[#02b34e] active:scale-95 rounded-md px-2 py-0.5 transition-all flex-shrink-0"
            >
              <span className="text-[11px] leading-none">N</span>
              부동산
            </a>
          )}

          <div className="flex-1" />

          {/* 방문 시간 + 알림 토글 */}
          {visit.visitTime && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-1 text-[13px] font-semibold text-slate-600">
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {visit.visitTime}
              </div>

              {/* 알림 토글 버튼 (1시간·30분 전 자동 알림) */}
              {canNotif && (
                <button
                  onClick={handleToggleNotif}
                  title={notifEnabled ? '알림 ON (1시간·30분 전) — 클릭하면 OFF' : '알림 OFF — 클릭하면 ON'}
                  className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition-all',
                    notifEnabled
                      ? 'bg-amber-50 border-amber-300 text-amber-600'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-500'
                  )}
                >
                  <svg className="w-3 h-3" fill={notifEnabled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {notifEnabled ? '알림 ON' : '알림'}
                </button>
              )}
            </div>
          )}

          {/* 수정 버튼 */}
          <button onClick={() => onEdit(visit)} className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>

          {/* 삭제 버튼 */}
          <button
            onClick={handleDel}
            className={cn(
              'flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-all flex-shrink-0 min-h-[28px]',
              confirmDel ? 'bg-red-50 text-red-500 border border-red-200' : 'text-slate-300 hover:text-red-400'
            )}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            {confirmDel && '확인'}
          </button>
        </div>

        {/* 매물명 */}
        <p className="text-[20px] font-black text-slate-900 tracking-tight leading-tight mb-1">{visit.apartmentName}</p>

        {/* 가격 */}
        {price && <p className="text-[17px] font-bold text-blue-600 mb-1.5">{price}</p>}

        {/* 분양권 상세 */}
        {isSale && (visit.basePrice || visit.optionPrice || visit.premium) && (
          <div className="flex gap-3 flex-wrap text-[11px] text-slate-400 mb-2">
            {visit.basePrice   && <span>분양가 {formatMan(visit.basePrice)}만원</span>}
            {visit.optionPrice && <span>+ 옵션 {formatMan(visit.optionPrice)}만원</span>}
            {visit.premium     && <span>+ P {formatMan(visit.premium)}만원</span>}
          </div>
        )}

        {/* 위치 */}
        <div className="text-[13px] text-slate-400 mb-3">
          {(() => {
            const areaLabel = visit.area
              ? (visit.area.endsWith('평') ? visit.area : `${visit.area}평`)
              : '';
            const typeLabel = visit.type
              ? (visit.type.endsWith('타입') ? visit.type : `${visit.type}타입`)
              : '';
            const dongHo = [visit.dong && `${visit.dong}동`, visit.ho && `${visit.ho}호`].filter(Boolean).join(' ');

            if (isHouse) {
              return (
                <span>
                  {[
                    visit.address,
                    dongHo,
                    [visit.rooms && `방 ${visit.rooms}개`, visit.bathrooms && `욕실 ${visit.bathrooms}개`].filter(Boolean).join(' · '),
                    areaLabel,
                  ].filter(Boolean).join(' · ')}
                </span>
              );
            }
            return (
              <>
                <span>
                  {[
                    dongHo,
                    [areaLabel, typeLabel].filter(Boolean).join(' / '),
                  ].filter(Boolean).join(' · ')}
                </span>
                {(visit.officetelResidential || visit.officetelBusiness) && (
                  <span className="ml-1.5 text-amber-600 font-semibold">
                    {visit.officetelResidential ? '주거용' : '업무용'} 오피스텔
                  </span>
                )}
              </>
            );
          })()}
        </div>

        {/* 하단 정보 */}
        <div className="border-t border-slate-100 pt-2.5 space-y-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center">
            {/* 전화 */}
            {visit.visitPhone && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l.83-.83a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span className="text-[12px] text-slate-500">{visit.visitPhone}</span>
                <a href={`tel:${visit.visitPhone}`} className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">전화</a>
              </div>
            )}

            {/* 입주 */}
            {(visit.immediateMove || visit.negotiateMove || visit.moveInDate) && (
              <div className="flex items-center gap-1.5 text-[12px]">
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {visit.immediateMove
                  ? <span className="text-emerald-600 font-bold">즉시입주</span>
                  : visit.negotiateMove
                    ? <span className="text-amber-600 font-bold">입주협의</span>
                    : <span className="text-slate-500">{visit.moveInDate.replace(/-/g, '.')}</span>}
              </div>
            )}

            {/* 반려동물 */}
            <div className="flex items-center gap-1 text-[12px]">
              <span>🐶🐱</span>
              <span className={cn('font-semibold', visit.hasPet === '불가능' ? 'text-red-500' : 'text-emerald-600')}>
                {visit.hasPet || '가능'}
              </span>
            </div>

            {/* 주차 (주택) */}
            {isHouse && visit.parking && (
              <div className="flex items-center gap-1 text-[12px]">
                <span>🚗</span>
                <span className={cn('font-semibold', visit.parking === '불가능' ? 'text-red-500' : visit.parking === '협의' ? 'text-amber-600' : 'text-emerald-600')}>
                  주차 {visit.parking}
                </span>
              </div>
            )}
          </div>

          {/* 공동중개사 */}
          {(visit.coBrokerAgency || visit.coBrokerPhone) && (
            <div className="flex items-center gap-2 flex-wrap">
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {visit.coBrokerAgency && <span className="text-[12px] text-slate-500">{visit.coBrokerAgency}</span>}
              {visit.coBrokerPhone  && <><span className="text-[12px] text-slate-500">{visit.coBrokerPhone}</span><a href={`tel:${visit.coBrokerPhone}`} className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">전화</a></>}
            </div>
          )}

          {/* 메모 */}
          {visit.memo && (
            <div className="flex gap-1.5 text-[12px] text-slate-500">
              <span>📝</span><span className="leading-relaxed">{visit.memo}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
