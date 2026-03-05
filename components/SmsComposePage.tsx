'use client';

import { useState, useEffect } from 'react';
import { Visit, BusinessCard } from '@/types';
import { buildSmsMessage, getPriceText, formatPhone, cn } from '@/lib/utils';

interface Props {
  visits:       Visit[];
  selectedIds:  Set<string>;
  onToggle:     (id: string) => void;
  businessCard: BusinessCard;
  onGoToList:   () => void;
}

export default function SmsComposePage({ visits, selectedIds, onToggle, businessCard, onGoToList }: Props) {
  const [includeCard,   setIncludeCard]   = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [editedMsg,     setEditedMsg]     = useState('');
  const [userEdited,    setUserEdited]    = useState(false);

  const selected = visits.filter(v => selectedIds.has(v.id));
  const autoMsg  = buildSmsMessage(selected, businessCard, includeCard);
  const filled   = !!(businessCard.officeName || businessCard.phone || businessCard.address);

  useEffect(() => {
    if (!userEdited) setEditedMsg(autoMsg);
  }, [autoMsg, userEdited]);

  function resetMsg() {
    setUserEdited(false);
    setEditedMsg(autoMsg);
  }

  function send() {
    const p = customerPhone.replace(/[^0-9+]/g, '');
    window.location.href = p ? `sms:${p}?body=${encodeURIComponent(editedMsg)}` : `sms:?body=${encodeURIComponent(editedMsg)}`;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-4">
        <h2 className="text-[19px] font-extrabold text-slate-900 tracking-tight">안내 문자 전송</h2>
        <p className="text-xs text-slate-400 mt-1">매물을 선택하고 고객에게 안내 문자를 보내세요</p>
      </div>

      {selected.length === 0 ? (
        <div className="mx-4 flex flex-col items-center py-14 bg-white rounded-2xl shadow-sm text-center">
          <svg className="w-12 h-12 text-slate-200 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p className="text-slate-600 font-bold">선택된 매물이 없습니다</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">전체 매물 탭에서 카드의 체크박스를 눌러 선택해 주세요</p>
          <button onClick={onGoToList} className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-bold rounded-xl shadow-sm">
            → 매물 목록으로
          </button>
        </div>
      ) : (
        <div className="px-4 pb-32 space-y-3">
          {/* 선택 매물 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">선택된 매물 ({selected.length}건)</span>
            </div>
            {selected.map(v => (
              <div key={v.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-slate-900 truncate">{v.apartmentName}</p>
                  <p className="text-[12px] text-blue-600">{getPriceText(v)}</p>
                </div>
                <button onClick={() => onToggle(v.id)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>

          {/* 명함 포함 토글 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[14px] font-bold text-slate-900">명함 정보 포함</p>
                <p className="text-[12px] text-slate-400 mt-0.5">{filled ? '부동산 정보를 메시지 하단에 추가합니다' : '설정 탭에서 명함 정보를 먼저 입력해 주세요'}</p>
              </div>
              <button
                onClick={() => setIncludeCard(p => !p)}
                className={cn('w-12 h-6 rounded-full relative transition-colors flex-shrink-0', includeCard ? 'bg-blue-500' : 'bg-slate-200')}
              >
                <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all', includeCard ? 'left-7' : 'left-1')} />
              </button>
            </div>
            {includeCard && filled && (
              <div className="mt-3 bg-slate-50 rounded-xl p-3 text-[12px] text-slate-500 space-y-1 leading-loose">
                {businessCard.officeName  && <div>🏢 {businessCard.officeName}</div>}
                {businessCard.managerName && <div>👤 {businessCard.managerName} 소장</div>}
                {businessCard.phone       && <div>📞 {businessCard.phone}</div>}
                {businessCard.address     && <div>📍 {businessCard.address}</div>}
                {businessCard.blog        && <div>🔗 {businessCard.blog}</div>}
              </div>
            )}
          </div>

          {/* 메시지 편집 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">메시지 편집</p>
              {userEdited && (
                <button onClick={resetMsg} className="text-[11px] font-semibold text-brand-500">
                  초기화
                </button>
              )}
            </div>
            <textarea
              value={editedMsg}
              onChange={e => { setEditedMsg(e.target.value); setUserEdited(true); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[12.5px] text-slate-600 leading-relaxed font-mono h-56 resize-none outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 transition-all"
            />
          </div>

          {/* 받는 분 연락처 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">받는 분 연락처 (선택)</p>
            <input type="tel" inputMode="numeric" value={customerPhone}
              onChange={e => setCustomerPhone(formatPhone(e.target.value))}
              placeholder="010-0000-0000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] font-medium outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all" />
            <p className="text-[11px] text-slate-400 mt-2">입력하면 해당 번호로 문자 앱이 바로 열립니다</p>
          </div>

          {/* 전송 버튼 */}
          <button onClick={send}
            className="w-full py-5 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-extrabold text-[16px] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-200 active:scale-[.98] transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            문자 앱으로 전송하기
          </button>
        </div>
      )}
    </div>
  );
}
