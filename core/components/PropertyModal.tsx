'use client';

import { useState, useCallback, useMemo } from 'react';
import { Visit, EMPTY_VISIT, CAT_LABELS, DEAL_LABELS, VALID_DEALS, DEFAULT_DEAL, Category, DealType } from '@/types';
import { formatPhone, cn } from '@/lib/utils';

const CARET = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

const inputCls = 'w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all';
const labelCls = 'block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5';
const selectCls = `${inputCls} cursor-pointer appearance-none pr-8`;

interface Props {
  initialData?: Visit;
  onSave:  (v: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onClose: () => void;
}

/* ── 방문시간 파싱 헬퍼 ── */
function parseVisitTime(t: string): { ampm: '오전' | '오후'; text: string } {
  if (!t) return { ampm: '오전', text: '' };
  if (t.startsWith('오전 ')) return { ampm: '오전', text: t.slice(3) };
  if (t.startsWith('오후 ')) return { ampm: '오후', text: t.slice(3) };
  // 레거시 HH:MM 포맷 변환
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (m) {
    const h = Number(m[1]);
    const ap: '오전' | '오후' = h < 12 ? '오전' : '오후';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return { ampm: ap, text: `${h12}:${m[2]}` };
  }
  return { ampm: '오전', text: t };
}

export default function PropertyModal({ initialData, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>>(
    () => initialData ? { ...initialData } : { ...EMPTY_VISIT }
  );
  const isEdit = !!initialData;

  // 방문시간 ↔ type="time" 변환 헬퍼
  function toTimeInput(t: string): string {
    const { ampm, text } = parseVisitTime(t);
    if (!text) return '';
    const parts = text.split(':');
    if (parts.length !== 2) return '';
    let h = Number(parts[0]);
    const m = Number(parts[1]);
    if (isNaN(h) || isNaN(m)) return '';
    if (ampm === '오후' && h !== 12) h += 12;
    if (ampm === '오전' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  function fromTimeInput(t: string): string {
    if (!t) return '';
    const [hStr, mStr] = t.split(':');
    const h = Number(hStr);
    const m = Number(mStr);
    if (isNaN(h) || isNaN(m)) return '';
    const ap = h < 12 ? '오전' : '오후';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${ap} ${h12}:${String(m).padStart(2, '0')}`;
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }, []);

  function changeCat(cat: Category) {
    setForm(p => ({
      ...p, category: cat,
      dealType: VALID_DEALS[cat].includes(p.dealType as DealType) ? p.dealType : DEFAULT_DEAL[cat],
    }));
  }

  function handleSubmit() {
    if (!form.apartmentName.trim()) { alert('이름을 입력해주세요.'); return; }
    if (isEdit && initialData) {
      onSave({ ...form, id: initialData.id });
    } else {
      onSave(form);
    }
  }

  const totalSaleRight = useMemo(
    () => (Number(form.basePrice)||0) + (Number(form.optionPrice)||0) + (Number(form.premium)||0),
    [form.basePrice, form.optionPrice, form.premium]
  );

  const isHouse    = form.category === 'house';
  const deals      = VALID_DEALS[form.category];
  const showOffice = form.category === 'apt' && (form.dealType === 'rental' || form.dealType === 'saleRightRental');
  const dateDisabled = form.immediateMove || form.negotiateMove;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 bg-black/50 flex flex-col justify-end" onClick={onClose}>
      <div className="animate-modal-up bg-white rounded-t-3xl max-h-[94dvh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex-shrink-0 px-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-extrabold text-lg text-slate-900">{isEdit ? '매물 수정' : '매물 등록'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{isEdit ? '정보를 수정하고 저장하세요' : '카테고리를 선택하고 정보를 입력하세요'}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* 대분류 */}
          <div className="flex gap-2 mb-3">
            {(['apt','sale','house'] as Category[]).map(cat => (
              <button key={cat} onClick={() => changeCat(cat)}
                className={cn('flex-1 py-2 text-[12px] font-bold rounded-xl border transition-all',
                  form.category === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300')}>
                {CAT_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* 거래유형 */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {deals.map(dt => (
              <button key={dt} onClick={() => setForm(p => ({ ...p, dealType: dt }))}
                className={cn('flex-1 py-2 text-[13px] font-bold rounded-lg transition-all',
                  form.dealType === dt ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                {DEAL_LABELS[dt]}
              </button>
            ))}
          </div>
        </div>
        <div className="h-px bg-slate-100 flex-shrink-0" />

        {/* 스크롤 폼 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

          {/* ① 아파트명 + 약속상태 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{isHouse ? '주택명 *' : '아파트명 *'}</label>
              <input name="apartmentName" value={form.apartmentName} onChange={handleChange} className={inputCls} />
              {showOffice && (
                <div className="flex gap-3 mt-1.5">
                  {[['officetelResidential','주거용'],['officetelBusiness','업무용']].map(([k,l]) => (
                    <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                      <CheckBox checked={!!form[k as keyof typeof form]} onChange={() => setForm(p => ({ ...p, [k]: !p[k as keyof typeof p] }))} size="sm" />
                      <span className={cn('text-[11px] font-semibold', form[k as keyof typeof form] ? 'text-emerald-600' : 'text-slate-500')}>{l}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>약속 상태</label>
              <select name="appointmentStatus" value={form.appointmentStatus} onChange={handleChange} className={selectCls}
                style={{ backgroundImage: CARET, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' }}>
                <option>가능</option><option>확인중</option><option>방문완료</option><option>불가</option>
              </select>
            </div>
          </div>

          {/* 네이버 부동산 URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-[#03c75a] rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black leading-none">N</span>
                </div>
                <label className={labelCls} style={{ marginBottom: 0 }}>네이버 부동산</label>
              </div>
              {form.naverUrl && (
                <a href={form.naverUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#03c75a] hover:bg-[#02b34e] rounded-lg px-2.5 py-1 transition-colors">
                  바로가기 →
                </a>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#03c75a] rounded flex items-center justify-center pointer-events-none flex-shrink-0">
                <span className="text-white text-[9px] font-black leading-none">N</span>
              </div>
              <input
                name="naverUrl"
                value={form.naverUrl || ''}
                onChange={handleChange}
                placeholder="네이버 부동산 URL 붙여넣기"
                className={`${inputCls} pl-9 text-xs`}
              />
            </div>
          </div>

          {/* 주소 (주택) */}
          {isHouse && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls} style={{marginBottom:0}}>주소</label>
                <a href="https://www.juso.go.kr/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 hover:bg-blue-100 transition-colors">
                  🏠 도로명주소
                </a>
              </div>
              <input name="address" value={form.address} onChange={handleChange} className={inputCls} />
            </div>
          )}

          {/* 동 / 호수 */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>동</label><input name="dong" value={form.dong} onChange={handleChange} className={inputCls} /></div>
            <div><label className={labelCls}>호수</label><input name="ho" value={form.ho} onChange={handleChange} className={inputCls} /></div>
          </div>

          {/* 평형 + 타입/방 수 */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>평형</label><input name="area" value={form.area} onChange={handleChange} className={inputCls} /></div>
            {isHouse
              ? <div><label className={labelCls}>방 수</label><input name="rooms" value={form.rooms} onChange={handleChange} className={inputCls} /></div>
              : <div><label className={labelCls}>타입</label><input name="type" value={form.type} onChange={handleChange} className={inputCls} /></div>}
          </div>

          {/* 욕실 (주택) */}
          {isHouse && (
            <div>
              <label className={labelCls}>욕실 수</label>
              <input name="bathrooms" value={form.bathrooms} onChange={handleChange} className={inputCls} />
            </div>
          )}

          {/* 가격 */}
          {form.dealType === 'sale' && (
            <PriceField label="매매가 (만원)" name="salePrice" value={form.salePrice} onChange={handleChange} />
          )}

          {(form.dealType === 'rental' || form.dealType === 'saleRightRental') && (
            <>
              <div>
                <label className={labelCls}>전세 / 월세</label>
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                  {[['jeonse','전세'],['monthly','월세']].map(([rt, lb]) => (
                    <button key={rt} onClick={() => setForm(p => ({ ...p, rentalType: rt as 'jeonse'|'monthly' }))}
                      className={cn('flex-1 py-2 text-[13px] font-bold rounded-lg transition-all',
                        form.rentalType === rt ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500')}>
                      {lb}
                    </button>
                  ))}
                </div>
              </div>
              {form.rentalType === 'jeonse'
                ? <PriceField label="전세가 (만원)" name="jeonsePrice" value={form.jeonsePrice} onChange={handleChange} />
                : <div className="grid grid-cols-2 gap-3">
                    <PriceField label="보증금 (만원)" name="deposit" value={form.deposit} onChange={handleChange} />
                    <PriceField label="월세 (만원)" name="monthlyRent" value={form.monthlyRent} onChange={handleChange} />
                  </div>
              }
            </>
          )}

          {form.dealType === 'saleRight' && (
            <>
              <PriceField label="분양가 (만원)" name="basePrice" value={form.basePrice} onChange={handleChange} />
              <div className="grid grid-cols-2 gap-3">
                <PriceField label="옵션가 (만원)" name="optionPrice" value={form.optionPrice} onChange={handleChange} />
                <PriceField label="프리미엄P (만원)" name="premium" value={form.premium} onChange={handleChange} />
              </div>
              <div className={cn('rounded-xl px-4 py-3 border transition-colors', totalSaleRight > 0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200')}>
                <div className={cn('text-lg font-extrabold', totalSaleRight > 0 ? 'text-blue-600' : 'text-slate-400')}>
                  {totalSaleRight > 0 ? `${totalSaleRight.toLocaleString('ko-KR')}만원` : '총분양가 자동 계산'}
                </div>
                {totalSaleRight > 0 && <div className="text-xs text-slate-400 mt-0.5">분양가 + 옵션가 + 프리미엄</div>}
              </div>
            </>
          )}

          {/* ③ 입주 가능일 + 방문 시간 (같은 줄) */}
          <div className="grid grid-cols-2 gap-3">
            {/* 입주 가능일 */}
            <div>
              <label className={labelCls}>입주 가능일</label>
              <input type="date" name="moveInDate"
                value={dateDisabled ? '' : form.moveInDate}
                disabled={dateDisabled}
                onChange={handleChange}
                className={cn(inputCls, dateDisabled && 'opacity-40 cursor-not-allowed')} />
              <div className="flex gap-2 mt-1.5">
                <label className="flex items-center gap-1 cursor-pointer">
                  <CheckBox color="green" checked={form.immediateMove}
                    onChange={() => setForm(p => ({ ...p, immediateMove: !p.immediateMove, negotiateMove: false, moveInDate: '' }))} size="sm" />
                  <span className={cn('text-[11px] font-semibold whitespace-nowrap', form.immediateMove ? 'text-emerald-600' : 'text-slate-400')}>즉시입주</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <CheckBox color="amber" checked={form.negotiateMove}
                    onChange={() => setForm(p => ({ ...p, negotiateMove: !p.negotiateMove, immediateMove: false, moveInDate: '' }))} size="sm" />
                  <span className={cn('text-[11px] font-semibold whitespace-nowrap', form.negotiateMove ? 'text-amber-600' : 'text-slate-400')}>입주협의</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <CheckBox color="green" checked={form.isVacant}
                    onChange={() => setForm(p => ({ ...p, isVacant: !p.isVacant }))} size="sm" />
                  <span className={cn('text-[11px] font-semibold whitespace-nowrap', form.isVacant ? 'text-emerald-600' : 'text-slate-400')}>공실</span>
                </label>
              </div>
            </div>

            {/* 방문 시간 */}
            <div>
              <label className={labelCls}>방문 시간</label>
              <input
                type="time"
                value={toTimeInput(form.visitTime)}
                onChange={e => setForm(p => ({ ...p, visitTime: fromTimeInput(e.target.value) }))}
                className={inputCls}
              />
            </div>
          </div>

          {/* ② 공동중개부동산 + 전화번호 (같은 줄) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>공동중개부동산</label>
              <input name="coBrokerAgency" value={form.coBrokerAgency} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>공동중개부동산 전화번호</label>
              <PhoneField value={form.coBrokerPhone} onChange={v => setForm(p => ({ ...p, coBrokerPhone: v }))} />
            </div>
          </div>

          {/* 반려동물 + 주차 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>반려동물</label>
              <select name="hasPet" value={form.hasPet} onChange={handleChange} className={selectCls}
                style={{ backgroundImage: CARET, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' }}>
                <option>가능</option><option>불가능</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>주차</label>
              <select name="parking" value={form.parking} onChange={handleChange} className={selectCls}
                style={{ backgroundImage: CARET, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' }}>
                <option>주차가능</option><option>주차불가능</option>
              </select>
            </div>
          </div>

          {/* 방문 연락처 */}
          <div>
            <label className={labelCls}>방문 연락처</label>
            <PhoneField value={form.visitPhone} onChange={v => setForm(p => ({ ...p, visitPhone: v }))} />
          </div>

          {/* 메모 */}
          <div>
            <label className={labelCls}>메모</label>
            <textarea name="memo" value={form.memo} onChange={handleChange} rows={3}
              placeholder="특이사항이나 메모를 입력하세요"
              className={`${inputCls} resize-y min-h-[64px] leading-relaxed`} />
          </div>

          {/* 등록/수정 버튼 */}
          <button onClick={handleSubmit}
            className={cn(
              'w-full py-4 text-white font-bold text-[15px] rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[.98] mt-1',
              isEdit ? 'bg-gradient-to-r from-blue-500 to-blue-700 shadow-blue-200' : 'bg-gradient-to-r from-brand-500 to-brand-700 shadow-brand-200'
            )}>
            {isEdit
              ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>수정 저장</>
              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>매물 등록 완료</>}
          </button>
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

/* ── 서브 컴포넌트 ── */
function PriceField({ label, name, value, onChange }: { label:string; name:string; value:string; onChange:(e:any)=>void }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input name={name} value={value} onChange={onChange} inputMode="numeric" autoComplete="off"
          className={`${inputCls} pr-12`} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">만원</span>
      </div>
    </div>
  );
}

function PhoneField({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l.83-.83a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      <input type="tel" inputMode="numeric" value={value}
        onChange={e => onChange(formatPhone(e.target.value))}
        className={`${inputCls} pl-8`} />
    </div>
  );
}

function CheckBox({ checked, onChange, color='slate', size='md' }: { checked:boolean; onChange:()=>void; color?:string; size?:'sm'|'md' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const bg = checked ? (color==='green' ? 'bg-emerald-500 border-emerald-500' : color==='amber' ? 'bg-amber-500 border-amber-500' : 'bg-blue-500 border-blue-500') : 'border-slate-300';
  return (
    <div onClick={onChange} className={cn('rounded flex items-center justify-center cursor-pointer transition-all border-2 flex-shrink-0', sz, bg)}>
      {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
    </div>
  );
}
