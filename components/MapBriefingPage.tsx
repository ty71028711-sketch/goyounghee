'use client';

import { useState } from 'react';
import { Visit, AppointmentStatus } from '@/types';
import { cn } from '@/lib/utils';

// 핀 위치 (지도 영역 내 % 기준, 12개 pre-set)
const PIN_POSITIONS: [number, number][] = [
  [18, 20], [58, 15], [80, 38], [38, 55], [12, 68], [65, 70],
  [85, 22], [44, 32], [25, 82], [72, 85], [52, 52], [28, 44],
];

function getPinBg(status: AppointmentStatus, isActive: boolean): string {
  if (isActive) {
    const m: Partial<Record<AppointmentStatus, string>> = {
      '가능':    'bg-emerald-500',
      '확인중':  'bg-amber-500',
      '방문완료': 'bg-blue-500',
      '불가':    'bg-red-500',
    };
    return (m[status] ?? 'bg-slate-600') + ' text-white border-white scale-110';
  }
  const m: Partial<Record<AppointmentStatus, string>> = {
    '가능':    'text-emerald-400 border-slate-700 hover:border-emerald-400',
    '확인중':  'text-amber-400 border-slate-700 hover:border-amber-400',
    '방문완료': 'text-blue-400 border-slate-700 hover:border-blue-400',
    '불가':    'text-red-400 border-slate-700 hover:border-red-400',
  };
  return 'bg-slate-900 ' + (m[status] ?? 'text-slate-400 border-slate-700');
}

function getDotBg(status: AppointmentStatus): string {
  const m: Partial<Record<AppointmentStatus, string>> = {
    '가능':    'bg-emerald-500',
    '확인중':  'bg-amber-500',
    '방문완료': 'bg-blue-500',
    '불가':    'bg-red-500',
  };
  return m[status] ?? 'bg-slate-500';
}

function getPinArrow(status: AppointmentStatus, isActive: boolean): string {
  if (isActive) {
    const m: Partial<Record<AppointmentStatus, string>> = {
      '가능':    'bg-emerald-500 border-white',
      '확인중':  'bg-amber-500 border-white',
      '방문완료': 'bg-blue-500 border-white',
      '불가':    'bg-red-500 border-white',
    };
    return m[status] ?? 'bg-slate-600 border-white';
  }
  return 'bg-slate-900 border-slate-700';
}

function getCardBorder(status: AppointmentStatus, isActive: boolean): string {
  if (!isActive) return 'border-slate-200 bg-white';
  const m: Partial<Record<AppointmentStatus, string>> = {
    '가능':    'border-emerald-400 bg-emerald-50',
    '확인중':  'border-amber-400 bg-amber-50',
    '방문완료': 'border-blue-400 bg-blue-50',
    '불가':    'border-red-400 bg-red-50',
  };
  return (m[status] ?? 'border-blue-400 bg-blue-50') + ' shadow-md';
}

function getNaverUrl(visit: Visit): string {
  if (visit.naverUrl) return visit.naverUrl;
  const q = [visit.apartmentName, visit.address].filter(Boolean).join(' ');
  return `https://land.naver.com/search/search.naver?query=${encodeURIComponent(q)}`;
}

interface Props {
  visits: Visit[];
}

export default function MapBriefingPage({ visits }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeVisit = visits.find(v => v.id === activeId) ?? null;

  function toggle(id: string) {
    setActiveId(prev => prev === id ? null : id);
  }

  function openNaver(visit: Visit, e?: React.MouseEvent) {
    e?.stopPropagation();
    window.open(getNaverUrl(visit), '_blank', 'noopener noreferrer');
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── 지도 시뮬레이션 ── */}
      <div className="flex-1 relative bg-[#0a0f1e] overflow-hidden min-h-0">

        {/* 격자 배경 */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        {/* 상단 라벨 */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 backdrop-blur-sm z-10">
          <svg className="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">지도 브리핑</span>
        </div>

        {/* 핀들 */}
        {visits.map((v, i) => {
          const [px, py] = PIN_POSITIONS[i % PIN_POSITIONS.length];
          const isActive = v.id === activeId;
          const shortName = v.apartmentName.split(' ').slice(0, 2).join(' ') || v.apartmentName;
          return (
            <div
              key={v.id}
              className="absolute transition-all duration-300 z-10"
              style={{ left: `${px}%`, top: `${py}%`, transform: 'translate(-50%, -100%)' }}
            >
              <div
                onClick={() => toggle(v.id)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className={cn(
                  'px-2.5 py-1.5 rounded-lg text-[10px] font-black border-2 shadow-xl transition-all whitespace-nowrap',
                  getPinBg(v.appointmentStatus, isActive)
                )}>
                  {shortName.length > 12 ? shortName.slice(0, 12) + '…' : shortName}
                </div>
                <div className={cn(
                  'w-2 h-2 rotate-45 -mt-[5px] border-r-2 border-b-2 transition-all',
                  getPinArrow(v.appointmentStatus, isActive)
                )} />
              </div>
            </div>
          );
        })}

        {/* 빈 상태 */}
        {visits.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-900/80 border border-slate-700 px-6 py-5 rounded-2xl text-center backdrop-blur-sm">
              <svg className="w-9 h-9 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <p className="text-sm font-bold text-slate-400">등록된 매물이 없습니다</p>
              <p className="text-[11px] text-slate-600 mt-0.5">매물 리스트에서 먼저 추가해 주세요</p>
            </div>
          </div>
        )}

        {/* 초기 안내 (매물 있고 선택 없을 때) */}
        {visits.length > 0 && !activeId && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-900/70 border border-slate-700 px-5 py-4 rounded-2xl text-center backdrop-blur-sm">
              <svg className="w-7 h-7 text-brand-400 mx-auto mb-1.5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <p className="text-sm font-bold text-white">핀을 클릭해 보세요</p>
              <p className="text-[11px] text-slate-400 mt-0.5">하단 카드 선택도 가능합니다</p>
            </div>
          </div>
        )}

        {/* 선택된 매물 플로팅 카드 */}
        {activeVisit && (
          <div className="absolute bottom-3 left-3 right-3 z-20">
            <div className="bg-slate-900 border border-blue-500/50 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
              <div className={cn('w-3 h-3 rounded-full flex-shrink-0', getDotBg(activeVisit.appointmentStatus))} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{activeVisit.apartmentName}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {activeVisit.visitTime ? `${activeVisit.visitTime} · ` : ''}
                  {activeVisit.appointmentStatus}
                  {activeVisit.dong ? ` · ${activeVisit.dong}동` : ''}
                </p>
              </div>
              <button
                onClick={() => openNaver(activeVisit)}
                className="flex-shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-colors"
              >
                네이버
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 하단 매물 카드 목록 (가로 스크롤) ── */}
      <div className="bg-white border-t border-slate-200 flex-shrink-0">
        <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            오늘 매물 {visits.length}건
          </p>
          {activeId && (
            <button onClick={() => setActiveId(null)} className="text-[10px] text-slate-400 hover:text-slate-600">
              선택 해제
            </button>
          )}
        </div>

        {visits.length > 0 ? (
          <div className="flex gap-2.5 overflow-x-auto px-3 pb-3">
            {visits.map(v => {
              const isActive = v.id === activeId;
              return (
                <div
                  key={v.id}
                  onClick={() => toggle(v.id)}
                  className={cn(
                    'flex-shrink-0 w-[152px] p-3 rounded-xl border-2 cursor-pointer transition-all',
                    getCardBorder(v.appointmentStatus, isActive)
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', getDotBg(v.appointmentStatus))} />
                    <span className="text-[10px] font-bold text-slate-500 truncate">{v.appointmentStatus}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-[12px] leading-tight line-clamp-2 mb-1">
                    {v.apartmentName}
                  </p>
                  {v.visitTime && (
                    <p className="text-[10px] text-slate-400">{v.visitTime}</p>
                  )}
                  {isActive && (
                    <button
                      onClick={e => openNaver(v, e)}
                      className="mt-2 w-full flex items-center justify-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      네이버 부동산
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[12px] text-slate-400 text-center py-3 px-3">
            매물 리스트에서 매물을 추가하세요
          </p>
        )}
      </div>
    </div>
  );
}
