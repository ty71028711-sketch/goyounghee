export default function PricingPreview() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-20">

      {/* 배지 */}
      <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
        가격 안내
      </span>

      {/* 타이틀 */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center leading-tight mb-3">
        7일 동안 무료로<br />사용해보세요
      </h2>

      {/* 서브텍스트 */}
      <p className="text-slate-500 text-base text-center mb-10">
        모든 기능을 제한 없이 사용할 수 있습니다
      </p>

      {/* 가격 카드 */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-sm p-8 flex flex-col items-center gap-6">

        {/* 무료체험 배지 */}
        <div className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
          7일 무료체험
        </div>

        {/* 가격 */}
        <div className="text-center">
          <p className="text-5xl font-black text-slate-900 tracking-tight">
            ₩0
          </p>
          <p className="text-slate-400 text-sm mt-1">7일간 무료</p>
        </div>

        {/* 구분선 */}
        <div className="w-full border-t border-slate-100" />

        {/* 이후 가격 */}
        <div className="text-center">
          <p className="text-slate-500 text-sm">7일 이후</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">
            연 <span className="text-blue-600">19,900원</span>
          </p>
          <p className="text-slate-400 text-xs mt-1">월 환산 약 1,658원</p>
        </div>

        {/* 자동 결제 없음 */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 w-full justify-center">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-700 text-sm font-semibold">자동 결제 없음</span>
        </div>

        {/* CTA 버튼 */}
        <a
          href="#apply"
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[.98] text-white font-bold text-base px-7 py-4 rounded-2xl transition-all shadow-lg shadow-blue-200"
        >
          7일 동안 직접 써보고 결정하세요 →
        </a>

        {/* 하단 안내 */}
        <p className="text-slate-400 text-xs text-center leading-relaxed">
          신용카드 없이 바로 시작 · 언제든 해지 가능
        </p>
      </div>

    </main>
  );
}
