'use client';

import { useState } from 'react';
import { submitApplication } from '@/lib/firestore';
import { ReceiptType } from '@/types';

type ApplyFormState = {
  name:          string;
  phone:         string;
  depositorName: string;
  googleEmail:   string;
  receiptType:   ReceiptType;
  receiptInfo:   string;
  plan:          string;
};

const EMPTY: ApplyFormState = {
  name: '', phone: '', depositorName: '', googleEmail: '',
  receiptType: '없음', receiptInfo: '',
  plan: '1년권 - 55,000원 (VAT 포함)',
};

export default function ApplicationForm() {
  const [form,    setForm]    = useState<ApplyFormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  function setField<K extends keyof ApplyFormState>(key: K, val: ApplyFormState[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // 클라이언트 유효성 검사
    if (!form.name.trim()) {
      setError('성함을 입력해 주세요.');
      return;
    }
    if (!form.phone.trim()) {
      setError('전화번호를 입력해 주세요.');
      return;
    }
    if (!form.depositorName.trim()) {
      setError('입금자명을 입력해 주세요.');
      return;
    }
    if (!form.googleEmail.trim()) {
      setError('구글 이메일을 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      await submitApplication({
        name:          form.name.trim(),
        phone:         form.phone.trim(),
        depositorName: form.depositorName.trim(),
        googleEmail:   form.googleEmail.trim(),
        receiptType:   form.receiptType,
        receiptInfo:   form.receiptInfo.trim(),
        plan:          form.plan,
      });
      setForm(EMPTY);
      setSuccess(true);
    } catch (err) {
      console.error('[ApplicationForm] 신청 오류:', err);
      setError('신청 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 카카오채널로 문의해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* 계좌 정보 카드 */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-5 mb-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
        </div>
        <div>
          <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-1">입금 계좌번호</p>
          <p className="text-white font-extrabold text-xl tracking-wider">토스뱅크 1002-4685-2754</p>
          <p className="text-slate-300 text-sm mt-0.5">예금주: <span className="font-bold text-white">임장메이트</span></p>
        </div>
      </div>

      {/* 신청 폼 카드 */}
      <div className="bg-[#0d1426] border border-blue-900/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-amber-400" />
        <form onSubmit={handleSubmit} noValidate className="px-6 py-8 space-y-5">

          <div>
            <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">
              성함 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="실명을 입력해 주세요"
              className="w-full bg-blue-950/50 border border-blue-800/60 rounded-xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">
              전화번호 <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setField('phone', e.target.value)}
              placeholder="010-0000-0000"
              className="w-full bg-blue-950/50 border border-blue-800/60 rounded-xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">
              입금자명 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.depositorName}
              onChange={e => setField('depositorName', e.target.value)}
              placeholder="실제 입금하시는 분의 성함"
              className="w-full bg-blue-950/50 border border-blue-800/60 rounded-xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">
              구글 아이디 (이메일) <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.googleEmail}
              onChange={e => setField('googleEmail', e.target.value)}
              placeholder="example@gmail.com"
              className="w-full bg-blue-950/50 border border-blue-800/60 rounded-xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 transition-colors"
            />
            <p className="text-slate-500 text-xs mt-1.5">서비스 로그인에 사용할 구글 계정 이메일</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-300 mb-2 uppercase tracking-widest">증빙 서류</label>
            <div className="flex gap-2 mb-3">
              {(['없음', '현금영수증', '세금계산서'] as ReceiptType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setField('receiptType', type)}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all ${
                    form.receiptType === type
                      ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-900/40'
                      : 'bg-blue-950/30 border-blue-800/40 text-slate-400 hover:border-blue-600/60'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {form.receiptType !== '없음' && (
              <input
                type="text"
                value={form.receiptInfo}
                onChange={e => setField('receiptInfo', e.target.value)}
                placeholder={form.receiptType === '현금영수증' ? '휴대폰 번호 또는 카드 번호' : '사업자 등록번호'}
                className="w-full bg-blue-950/50 border border-blue-800/60 rounded-xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 transition-colors"
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">신청 플랜</label>
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl px-4 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-base">1년 이용권</p>
                <p className="text-slate-400 text-sm mt-0.5">월 4,500원 상당 · 자동 갱신 없음</p>
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-extrabold text-2xl">55,000원</p>
                <p className="text-slate-500 text-xs">VAT 포함</p>
              </div>
            </div>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-red-400 text-sm leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-60 text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-blue-900/50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white"/>
                </svg>
                신청 중...
              </>
            ) : (
              <>
                신청하기
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>

          <p className="text-slate-500 text-sm text-center leading-relaxed">
            입금 확인 후 최대 1시간 이내 서비스가 활성화됩니다.<br />
            문의:{' '}
            <a href="http://pf.kakao.com/_LDfqX/chat" target="_blank" rel="noopener noreferrer"
              className="text-amber-400 hover:underline font-bold">
              카카오채널 소장노트
            </a>
          </p>
        </form>
      </div>

      {/* 신청 완료 팝업 */}
      {success && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-amber-400" />
            <div className="px-8 py-10 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 className="text-slate-900 font-extrabold text-2xl mb-2">관리자 승인중</h3>
              <p className="text-slate-500 text-base leading-relaxed mb-6">
                신청이 접수되었습니다!<br />
                입금 확인 후 최대{' '}
                <span className="text-blue-600 font-bold">1시간 이내</span>로<br />
                서비스가 승인됩니다.<br /><br />
                빠른 승인이 필요하시면 카카오채널로<br />
                입금 완료 사실을 알려주세요!
              </p>
              <a href="http://pf.kakao.com/_LDfqX/chat" target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#f5dc00] text-[#3A1D1D] font-bold text-base py-4 rounded-2xl transition-all shadow-md shadow-yellow-200 mb-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3A1D1D">
                  <path d="M12 3C6.48 3 2 6.69 2 11.25c0 2.91 1.72 5.48 4.35 7.02l-.87 3.19a.5.5 0 0 0 .74.57l3.73-2.15c.64.09 1.3.14 1.97.14 5.52 0 10-3.69 10-8.25S17.52 3 12 3z"/>
                </svg>
                카카오채널에서 입금 알리기
              </a>
              <button
                onClick={() => setSuccess(false)}
                className="w-full py-3.5 text-slate-400 hover:text-slate-600 text-sm font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
