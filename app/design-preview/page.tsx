import MobilePreviewSection from '@/components/MobilePreviewSection';

export default function DesignPreviewPage() {
  return (
    <main className="min-h-screen bg-[#050d1f]">
      <div className="bg-yellow-400/10 border-b border-yellow-400/30 py-3 px-6 text-center">
        <p className="text-yellow-300 text-sm font-bold">
          🔍 디자인 미리보기 전용 페이지 — 실제 서비스에 반영되지 않습니다
        </p>
      </div>
      <MobilePreviewSection />
    </main>
  );
}
