'use client';

const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
      </svg>
    ),
    color: 'blue',
    title: '매물 1개 입력하기',
    desc: '오늘 안내할 매물의 단지명, 가격, 층수를 입력하세요.\n30초면 충분합니다.',
    cta: '매물 입력하러 가기 →',
    ctaHref: '/dashboard',
  },
  {
    num: '02',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    color: 'amber',
    title: '오늘 볼 매물 체크하기',
    desc: '여러 매물 중 오늘 임장할 것만 체크하면\n방문 시간순으로 자동 정렬됩니다.',
    cta: '일정 정리하러 가기 →',
    ctaHref: '/dashboard',
  },
  {
    num: '03',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    color: 'emerald',
    title: '현장에서 모바일로 확인',
    desc: '스마트폰 브라우저에서 app.sojangnote.com을 열면\nPC에서 입력한 매물이 그대로 보입니다.',
    cta: '모바일 접속 방법 보기 →',
    ctaHref: '/dashboard',
  },
  {
    num: '04',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: 'purple',
    title: '손님에게 매물 문자 전송',
    desc: '안내한 매물을 버튼 하나로 문자 전송.\n사무실에 돌아와 다시 정리할 필요 없습니다.',
    cta: '문자 전송 기능 보기 →',
    ctaHref: '/dashboard',
  },
];

const colorMap: Record<string, string> = {
  blue:    'bg-blue-500/15   border-blue-500/30   text-blue-400',
  amber:   'bg-amber-500/15  border-amber-500/30  text-amber-400',
  emerald: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  purple:  'bg-purple-500/15  border-purple-500/30  text-purple-400',
};
const numColorMap: Record<string, string> = {
  blue:    'text-blue-400',
  amber:   'text-amber-400',
  emerald: 'text-emerald-400',
  purple:  'text-purple-400',
};
const ctaColorMap: Record<string, string> = {
  blue:    'text-blue-400   hover:text-blue-300',
  amber:   'text-amber-400  hover:text-amber-300',
  emerald: 'text-emerald-400 hover:text-emerald-300',
  purple:  'text-purple-400  hover:text-purple-300',
};

export default function OnboardingGuide() {
  return (
    <section className="bg-[#080f22] py-20 px-5">
      <div className="max-w-2xl mx-auto">

        {/* 헤더 */}
        <div className="text-center mb-12">
          <p className="text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">Getting Started</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            처음이라면<br />이렇게 시작하세요
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            매물 입력부터 현장 확인, 손님 문자 전송까지<br />
            <span className="text-white font-semibold">4단계로 바로 시작할 수 있습니다.</span>
          </p>
        </div>

        {/* 4단계 카드 */}
        <div className="space-y-4">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="bg-[#0d1a2e] border border-blue-900/40 rounded-2xl px-6 py-5 flex items-start gap-5 hover:border-blue-700/50 transition-colors"
            >
              {/* 아이콘 */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center ${colorMap[step.color]}`}>
                {step.icon}
              </div>

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-black tracking-widest ${numColorMap[step.color]}`}>{step.num}</span>
                  <p className="text-white font-bold text-base">{step.title}</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line mb-3">{step.desc}</p>
                <a
                  href={step.ctaHref}
                  className={`text-sm font-bold transition-colors ${ctaColorMap[step.color]}`}
                >
                  {step.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 문구 */}
        <p className="text-center text-slate-500 text-sm mt-10 leading-relaxed">
          막히는 부분이 있으면{' '}
          <a
            href="http://pf.kakao.com/_LDfqX/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 font-bold hover:underline"
          >
            카카오채널 소장노트
          </a>
          로 문의해 주세요.
        </p>

      </div>
    </section>
  );
}
