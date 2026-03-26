import OnboardingGuide from '@/components/OnboardingGuide';

export default function OnboardingPreviewPage() {
  return (
    <main className="min-h-screen bg-[#080f22]">
      {/* 미리보기 전용 안내 배너 */}
      <div className="bg-yellow-400/10 border-b border-yellow-400/30 py-3 px-6 text-center">
        <p className="text-yellow-300 text-sm font-bold">
          🔍 온보딩 UI 미리보기 — 기존 서비스 로직과 완전히 분리된 프리뷰입니다
        </p>
      </div>

      <OnboardingGuide />
    </main>
  );
}
