export default function HeroSpacingPreview() {
  return (
    <div className="min-h-screen bg-[#050d1f] relative overflow-hidden flex flex-col">

      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-blue-800/8 rounded-full blur-[100px]" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/40">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <path d="M9 22v-4h6v4"/>
              <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">소장노트 <span className="text-blue-400">PRO</span></span>
        </div>
        <span className="text-xs text-blue-300/70 border border-blue-700/50 bg-blue-900/20 rounded-full px-3 py-1">
          공인중개사 전용
        </span>
      </header>

      {/* 히어로 본문 */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-12 max-w-2xl mx-auto w-full text-center">

        {/* 그룹1 - 문제 제기 */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm font-semibold mb-5">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse flex-shrink-0" />
            15년 차 현직 소장이 직접 만든 실무 100% 도구
          </div>
          <p className="text-slate-400 text-xl sm:text-2xl font-bold">
            아직도 매물을 노트에 적으세요?
          </p>
        </div>

        {/* 그룹2 - 핵심 메시지 */}
        <div className="mb-10">
          <h1 className="font-black text-white leading-snug text-3xl sm:text-5xl drop-shadow-[0_0_24px_rgba(255,255,255,0.12)] max-w-xl mx-auto">
            다음 집 찾느라<br />
            손님 앞에서 헤매지 마세요
          </h1>
          <p className="mt-4 text-2xl sm:text-4xl font-black text-white leading-snug">
            <span className="text-blue-400">임장 순서,</span> 자동으로 정리됩니다
          </p>
        </div>

        {/* 그룹3 - 혜택 */}
        <div className="mb-10 bg-blue-500/5 border border-blue-500/20 rounded-2xl px-6 py-5 max-w-sm w-full mx-auto">
          <p className="text-slate-300 text-base leading-relaxed">
            지금 시작하면<br />
            <span className="text-white font-bold">7일 동안 모든 기능 무료</span>
          </p>
          <p className="text-slate-500 text-sm mt-2">
            결제 없이 바로 시작됩니다
          </p>
        </div>

        {/* 그룹4 - CTA */}
        <div className="flex flex-col items-center gap-3 w-full max-w-[320px] mx-auto">
          <a
            href="#apply"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[.98] text-white font-bold text-base px-7 py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40"
          >
            7일 무료체험 시작하기 →
          </a>
          <p className="text-slate-500 text-xs text-center leading-relaxed">
            로그인만 하면 바로 사용 가능합니다 · 자동 결제 없음
          </p>
        </div>

      </main>
    </div>
  );
}
