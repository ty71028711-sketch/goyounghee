export default function HeroSpacingFixPreview() {
  return (
    <div className="bg-[#050d1f]">
      <div className="min-h-screen text-white flex flex-col relative overflow-hidden">

        {/* 배경 — 기존 동일 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-800/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        {/* 헤더 — 기존 동일 */}
        <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/40">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <path d="M9 22v-4h6v4"/>
                <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">소장노트 <span className="text-blue-400">PRO</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-300/70 border border-blue-700/50 bg-blue-900/20 rounded-full px-3 py-1">
              공인중개사 전용
            </span>
            <button className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 px-4 py-1.5 rounded-full transition-all shadow-md shadow-blue-900/50">
              멤버 로그인
            </button>
          </div>
        </header>

        {/* 히어로 본문 — 기존 동일 */}
        <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 px-6 py-10 max-w-6xl mx-auto w-full gap-12">

          {/* 텍스트 영역 */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm font-semibold mb-6">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse flex-shrink-0" />
              15년 차 현직 소장이 직접 만든 실무 100% 도구
            </div>

            {/* ↓ 변경: mb-6 → mb-10 (CTA 전 여백 확보) */}
            <h1 className="font-black text-white leading-tight mb-10">
              <span className="block text-xl sm:text-2xl text-slate-400 font-bold mb-2">아직도 매물을 노트에 적으세요?</span>
              <span className="block text-3xl sm:text-5xl drop-shadow-[0_0_24px_rgba(255,255,255,0.12)]">
                다음 집 찾느라<br />손님 앞에서 헤매지 마세요
              </span>
              {/* ↓ 변경: 두 번째 문장을 별도 span으로 분리 + mt-5 추가 */}
              <span className="block text-3xl sm:text-5xl drop-shadow-[0_0_24px_rgba(255,255,255,0.12)] mt-5">
                <span className="text-blue-400">임장 순서,</span> 자동으로 정리됩니다
              </span>
            </h1>

            {/* CTA — 기존 동일 */}
            <div className="flex flex-col items-center gap-3 w-full max-w-[320px]">
              <a
                href="#apply"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[.98] text-white font-bold text-base px-7 py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40"
              >
                7일 무료체험 시작하기 →
              </a>
              <button className="w-full inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 active:scale-[.98] text-slate-300 font-semibold text-sm px-7 py-3 rounded-2xl transition-all border border-slate-600 hover:border-slate-400">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google 계정으로 로그인
              </button>
              <p className="text-slate-500 text-xs text-center leading-relaxed">
                로그인만 하면 바로 사용 가능합니다 · 자동 결제 없음
              </p>
            </div>
          </div>

          {/* 스마트폰 모컵 — 기존 동일 */}
          <div className="flex-shrink-0 relative">
            <div className="relative w-[260px] sm:w-[300px]">
              <div className="bg-gradient-to-b from-slate-700 to-slate-900 rounded-[3rem] p-[3px] shadow-[0_30px_80px_-10px_rgba(37,99,235,0.5)]">
                <div className="bg-[#0a0f1e] rounded-[2.8rem] overflow-hidden">
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-24 h-6 bg-slate-800 rounded-full" />
                  </div>
                  <div className="px-4 pb-6 space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-white font-bold text-sm">소장노트 PRO</p>
                        <p className="text-blue-400 text-[10px]">오늘 임장 매물 현황</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="4" y="2" width="16" height="20" rx="2"/>
                          <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01"/>
                        </svg>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-600/20 border border-blue-600/30 rounded-2xl p-3">
                        <p className="text-blue-300 text-[9px] font-bold uppercase">오늘 임장</p>
                        <p className="text-white font-black text-2xl">8</p>
                        <p className="text-blue-400 text-[9px]">건</p>
                      </div>
                      <div className="bg-emerald-600/20 border border-emerald-600/30 rounded-2xl p-3">
                        <p className="text-emerald-300 text-[9px] font-bold uppercase">관심 매물</p>
                        <p className="text-white font-black text-2xl">3</p>
                        <p className="text-emerald-400 text-[9px]">건</p>
                      </div>
                    </div>
                    {[
                      { name: '래미안 101동 1502호', tag: '아파트', price: '5.2억', color: 'blue' },
                      { name: '힐스테이트 B동 802호', tag: '오피스텔', price: '2.8억', color: 'purple' },
                      { name: '신축빌라 201호', tag: '주택', price: '1.9억', color: 'emerald' },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white ${
                          item.color === 'blue' ? 'bg-blue-600' : item.color === 'purple' ? 'bg-purple-600' : 'bg-emerald-600'
                        }`}>{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[10px] font-bold truncate">{item.name}</p>
                          <p className="text-slate-400 text-[9px]">{item.tag}</p>
                        </div>
                        <span className="text-amber-400 text-[10px] font-black flex-shrink-0">{item.price}</span>
                      </div>
                    ))}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl py-2.5 flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      <span className="text-white text-[10px] font-bold">고객 안내문자 전송</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/50 animate-pulse">
                실시간 연동
              </div>
            </div>
          </div>
        </main>

        {/* 스크롤 유도 — 기존 동일 */}
        <div className="relative z-10 flex justify-center pb-8">
          <div className="flex flex-col items-center gap-2 text-slate-500 text-xs animate-bounce">
            <span>아래로 스크롤</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
