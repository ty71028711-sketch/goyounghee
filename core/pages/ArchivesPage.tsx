'use client';

import { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useArchives } from '../hooks/useArchives';
import { Archive, Visit } from '@/types';
import { getPriceText, cn } from '@/lib/utils';

function VisitRow({ v }: { v: Visit }) {
  const statusColor =
    v.appointmentStatus === '방문완료' ? 'text-blue-600'
    : v.appointmentStatus === '가능'   ? 'text-emerald-600'
    : v.appointmentStatus === '확인중' ? 'text-amber-600'
    : 'text-red-500';

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 truncate">{v.apartmentName}</p>
        {getPriceText(v) && (
          <p className="text-[11px] text-slate-400">{getPriceText(v)}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {v.visitTime && (
          <span className="text-[11px] text-slate-500">{v.visitTime}</span>
        )}
        <span className={cn('text-[10px] font-bold', statusColor)}>{v.appointmentStatus}</span>
      </div>
    </div>
  );
}

function ArchiveCard({ arc, onDelete }: { arc: Archive; onDelete: (id: string) => void }) {
  const [expanded,   setExpanded]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const completedCount = arc.visits.filter(v => v.appointmentStatus === '방문완료').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-3 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <svg className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"/><path d="M9 7h6M9 11h6M9 15h4"/>
              </svg>
              <p className="text-[13px] font-bold text-slate-900">{arc.visitDate}</p>
            </div>
            <p className="text-[12px] text-slate-500 ml-5.5">
              총 <strong className="text-slate-800">{arc.visitCount}</strong>건
              {completedCount > 0 && (
                <> · <span className="text-blue-600 font-semibold">방문완료 {completedCount}건</span></>
              )}
            </p>
          </div>

          {/* 펼치기 + 삭제 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {expanded ? '접기' : '상세'}
              <svg className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <button
              onClick={() => {
                if (confirmDel) { onDelete(arc.id); }
                else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); }
              }}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all',
                confirmDel ? 'bg-red-50 border-red-300 text-red-500' : 'text-slate-300 border-transparent hover:text-red-400 hover:border-red-200'
              )}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              {confirmDel ? '삭제확인' : '삭제'}
            </button>
          </div>
        </div>
      </div>

      {/* 상세 목록 */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-slate-100">
          <div className="mt-2">
            {arc.visits.map((v, i) => <VisitRow key={v.id || i} v={v} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArchivesPage() {
  const { firebaseUser }         = useAuth();
  const { archives, saving, remove } = useArchives(firebaseUser?.uid);

  if (archives.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"/><path d="M9 7h6M9 11h6M9 15h4"/>
            </svg>
          </div>
          <p className="text-[15px] font-bold text-slate-700 mb-1">아직 보관된 기록이 없습니다</p>
          <p className="text-[12px] text-slate-400 leading-relaxed">
            매물 리스트에서 <strong className="text-brand-500">[보관함 저장]</strong> 버튼을 누르면<br/>
            오늘의 방문 기록이 여기에 저장됩니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-8">
      <div className="px-1 pt-4 pb-3">
        <h2 className="text-[18px] font-black text-slate-900">방문 보관함</h2>
        <p className="text-[12px] text-slate-400 mt-0.5">총 {archives.length}개의 저장 기록</p>
      </div>

      {saving && (
        <div className="text-center py-4 text-[12px] text-brand-600 font-semibold">저장 중...</div>
      )}

      {archives.map(arc => (
        <ArchiveCard key={arc.id} arc={arc} onDelete={remove} />
      ))}
    </div>
  );
}
