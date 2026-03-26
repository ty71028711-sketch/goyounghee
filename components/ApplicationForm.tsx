'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitApplication } from '@/lib/firestore';
import { ReceiptType } from '@/types';
import { useAuth } from '@/auth/AuthContext';

type ApplyFormState = {
  name:          string;
  phone:         string;
  depositorName: string;
  receiptType:   ReceiptType;
  receiptInfo:   string;
  plan:          string;
};

const EMPTY: ApplyFormState = {
  name: '', phone: '', depositorName: '',
  receiptType: '없음', receiptInfo: '',
  plan: '1년권 - 19,900원 (VAT 포함)',
};

export default function ApplicationForm() {
  const { firebaseUser, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [form,    setForm]    = useState<ApplyFormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  function setField<K extends keyof ApplyFormState>(key: K, val: ApplyFormState[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firebaseUser) {
      setError('Google 로그인 후 신청할 수 있습니다.');
      return;
    }

    // 클라이언트 유효성 검사
    if (!form.name.trim()) {
      setError('성함을 입력해 주세요.');
      return;
    }
    if (!form.phone.trim()) {
      setError('전화번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      await submitApplication({
        uid:           firebaseUser.uid,
        name:          form.name.trim(),
        phone:         form.phone.trim(),
        depositorName: form.depositorName.trim(),
        googleEmail:   firebaseUser.email ?? '',
        receiptType:   form.receiptType,
        receiptInfo:   form.receiptInfo.trim(),
        plan:          form.plan,
      });
      router.push('/pending');
    } catch (err) {
      console.error('[ApplicationForm] 신청 오류:', err);
      setError('신청 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 카카오채널로 문의해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  if (!firebaseUser) {
    return (
      <div className="bg-[#0d1426] border border-blue-900/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-amber-400" />
        <div className="px-6 py-10 text-center space-y-5">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg mb-3 leading-snug">
              Google 계정으로 로그인하면<br />별도 회원가입 없이 바로 사용 가능합니다.
            </p>
            <ul className="text-slate-400 text-sm leading-relaxed space-y-1 text-left inline-block">
              <li>✔ 임장 기록 자동 저장</li>
              <li>✔ PC · 모바일 동기화</li>
              <li>✔ 7일 무료 체험 바로 시작</li>
            </ul>
          </div>
          <button
            onClick={signInWithGoogle}
            className="w-full py-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 무료 체험 시작
          </button>
        </div>
      </div>
    );
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

          {/* 폼 상단 안내 */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3.5 space-y-1">
            <p className="text-blue-300 text-sm font-bold leading-snug">
              구글 로그인 후 7일 무료체험이 바로 시작됩니다.
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              지금은 결제 단계가 아니며, 체험 후 원하실 때 유료 전환할 수 있습니다.
            </p>
          </div>

          <p className="text-slate-400 text-xs text-center">
            무료체험 시작을 위해 아래 정보만 입력해주세요 &nbsp;·&nbsp; 성함 · 전화번호 · 구글계정
          </p>

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
              입금자명
            </label>
            <input
              type="text"
              value={form.depositorName}
              onChange={e => setField('depositorName', e.target.value)}
              placeholder="실제 입금하시는 분의 성함"
              className="w-full bg-blue-950/50 border border-blue-800/60 rounded-xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 transition-colors"
            />
            <p className="text-slate-500 text-xs mt-1.5">무료체험 시작에는 입력하지 않아도 됩니다. 유료 전환 시 사용됩니다.</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">
              구글 아이디 (이메일)
            </label>
            <div className="w-full bg-blue-950/30 border border-blue-800/40 rounded-xl px-4 py-3.5 text-base text-slate-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {firebaseUser.email}
            </div>
            <p className="text-slate-500 text-xs mt-1.5">로그인한 Google 계정으로 자동 설정됩니다</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">증빙 서류</label>
            <p className="text-slate-500 text-xs mb-2">증빙서류는 유료 결제 시 선택 가능합니다.</p>
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
                <p className="text-amber-400 font-extrabold text-2xl">19,900원</p>
                <p className="text-slate-500 text-xs">VAT 포함</p>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              현재는 7일 무료체험이 먼저 시작됩니다. 이후 원하실 경우 1년 이용권(19,900원)으로 전환 가능합니다.
            </p>
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

          <p className="text-slate-400 text-xs text-center">구글 로그인 후 무료체험이 시작됩니다.</p>

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

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-center">
            <p className="text-emerald-400 text-sm font-bold leading-relaxed">
              7일 체험 후 유료로 자동 연장되지 않으니 안심하고 사용하세요.
            </p>
          </div>
          <p className="text-slate-500 text-sm text-center leading-relaxed">
            문의:{' '}
            <a href="http://pf.kakao.com/_LDfqX/chat" target="_blank" rel="noopener noreferrer"
              className="text-amber-400 hover:underline font-bold">
              카카오채널 소장노트
            </a>
          </p>
        </form>
      </div>

    </>
  );
}
