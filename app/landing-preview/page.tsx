import MobilePreviewSection from '@/components/MobilePreviewSection';
import OnboardingGuide from '@/components/OnboardingGuide';

/**
 * 랜딩페이지 프리뷰 — 실제 서비스에 영향 없음
 * 목적: SECTION 5 → OnboardingGuide → SECTION 6(신청폼) 흐름 확인
 * auth/Firebase/권한 로직 없음
 */
export default function LandingPreviewPage() {
  return (
    <main className="min-h-screen bg-[#050d1f]">

      {/* ── 프리뷰 안내 배너 ── */}
      <div className="sticky top-0 z-50 bg-yellow-400/10 border-b border-yellow-400/30 py-2.5 px-6 text-center">
        <p className="text-yellow-300 text-xs font-bold">
          🔍 전체 랜딩 흐름 프리뷰 — SECTION 5 → 온보딩 가이드 → 신청폼 순서 확인용 · 실제 서비스에 반영되지 않습니다
        </p>
      </div>

      {/* ── 앞 섹션 요약 표시 (실제 랜딩 위치 감각용) ── */}
      <div className="bg-[#080f22] border-b border-blue-900/30 py-6 px-5 text-center">
        <p className="text-slate-600 text-xs uppercase tracking-widest">↑ SECTION 1~4 (히어로 · 문제제기 · 핵심기능 · 가성비) — 기존과 동일</p>
      </div>

      {/* ── SECTION 5 · 모바일 접속 안내 (기존 그대로) ── */}
      <MobilePreviewSection />

      {/* ── [NEW] OnboardingGuide 삽입 위치 ── */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 flex justify-center z-10 -translate-y-3">
          <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
            ✦ 새로 추가되는 섹션
          </span>
        </div>
        <div className="border-t-2 border-dashed border-blue-500/40">
          <OnboardingGuide />
        </div>
      </div>

      {/* ── SECTION 6 · 신청폼 플레이스홀더 (auth 불필요) ── */}
      <section className="bg-[#0e2044] py-20 px-5">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">SECTION 6</p>
            <h2 className="text-2xl font-extrabold text-white mb-2">소장노트 PRO 7일 무료 체험 신청</h2>
            <p className="text-slate-400 text-sm">↓ 실제 신청 폼 위치 (Google 로그인 · 성함 · 전화번호 입력)</p>
          </div>
          <div className="bg-[#0d1426] border border-blue-900/50 rounded-2xl px-6 py-10 text-center space-y-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <p className="text-slate-400 text-sm">실제 화면에서는 Google 로그인 버튼 / 신청서 폼이 렌더링됩니다.</p>
            <div className="w-full py-4 bg-white/10 border border-white/20 rounded-2xl text-slate-400 text-sm font-bold">
              Google 계정으로 무료 체험 시작 (실제 버튼)
            </div>
          </div>
          <p className="text-center text-emerald-400 text-sm font-bold bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
            7일 체험 후 유료로 자동 연장되지 않으니 안심하고 사용하세요.
          </p>
        </div>
      </section>

    </main>
  );
}
