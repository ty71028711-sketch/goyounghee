'use client';

export default function MobilePreviewSection() {
  return (
    <section className="bg-[#0a1628] py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* 좌측: 스마트폰 목업 */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="relative">
              {/* 폰 외형 */}
              <div className="w-56 bg-slate-800 rounded-[2.5rem] p-2 shadow-2xl border border-slate-600/50"
                style={{ boxShadow: '0 0 0 1px rgba(100,120,200,0.15), 0 30px 80px rgba(0,0,0,0.6)' }}>
                {/* 노치 */}
                <div className="flex justify-center mb-1">
                  <div className="w-20 h-5 bg-slate-900 rounded-b-2xl flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                    <div className="w-8 h-1 bg-slate-700 rounded-full" />
                  </div>
                </div>
                {/* 화면 영역 */}
                <div className="bg-[#f0f4ff] rounded-[2rem] overflow-hidden" style={{ minHeight: '440px' }}>
                  {/* 상단 헤더 */}
                  <div className="bg-white px-3 pt-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-[8px] font-black">소</span>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-800 leading-none">소장노트 PRO</p>
                          <p className="text-[6px] text-slate-400 leading-none mt-0.5">임장관리시스템</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] bg-amber-100 text-amber-600 font-bold px-1.5 py-0.5 rounded">체험중</span>
                        <span className="text-[7px] text-slate-400 font-mono">07:27</span>
                      </div>
                    </div>
                  </div>

                  {/* 날짜 바 */}
                  <div className="bg-blue-50 px-3 py-1.5 flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-sm" />
                    <p className="text-[7px] text-blue-600 font-bold">2026년 3월 16일 ›</p>
                    <p className="text-[7px] text-slate-400 ml-1">매물 안내 리스트</p>
                  </div>

                  {/* 매물 카드 1 */}
                  <div className="bg-white mx-2 mt-2 rounded-xl p-2.5 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-slate-300 rounded-full" />
                        <span className="text-[7px] bg-blue-100 text-blue-600 font-bold px-1 py-0.5 rounded">기준</span>
                        <span className="text-[7px] text-slate-400">전세</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[6px] text-slate-400">오후 3:30</span>
                        <span className="text-[7px] bg-amber-400 text-white font-bold px-1 py-0.5 rounded">8번안</span>
                      </div>
                    </div>
                    <p className="text-[8px] font-bold text-slate-800 leading-snug mb-0.5">검단호반호수공원역호반써밋</p>
                    <p className="text-[7px] text-blue-600 font-bold">전세 35,000만원</p>
                    <p className="text-[6px] text-slate-400 mt-0.5">101동 101호 · 34평 / 34평</p>
                    <div className="flex gap-1 mt-1.5">
                      <span className="text-[6px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">☎ 010-1234-5678</span>
                      <span className="text-[6px] bg-green-100 text-green-600 px-1 py-0.5 rounded">전세</span>
                      <span className="text-[6px] bg-amber-100 text-amber-600 px-1 py-0.5 rounded">남향</span>
                    </div>
                  </div>

                  {/* 매물 카드 2 */}
                  <div className="bg-white mx-2 mt-1.5 rounded-xl p-2.5 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-slate-300 rounded-full" />
                        <span className="text-[7px] bg-blue-100 text-blue-600 font-bold px-1 py-0.5 rounded">기준</span>
                        <span className="text-[7px] text-slate-400">전세</span>
                      </div>
                      <span className="text-[6px] text-slate-400">오후 3:30</span>
                    </div>
                    <p className="text-[8px] font-bold text-slate-800 leading-snug mb-0.5">힐스테이트신검단센트럴</p>
                    <p className="text-[7px] text-blue-600 font-bold">매 435,000만원 · 전세 전체 41,000만원</p>
                    <p className="text-[6px] text-slate-400 mt-0.5">101동 101호 · 34평 / 34평</p>
                    <div className="flex gap-1 mt-1.5">
                      <span className="text-[6px] bg-red-100 text-red-500 px-1 py-0.5 rounded">축성임박</span>
                      <span className="text-[6px] bg-yellow-100 text-yellow-600 px-1 py-0.5 rounded">탑층</span>
                      <span className="text-[6px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded">분가능</span>
                    </div>
                  </div>

                  {/* FAB */}
                  <div className="flex justify-end px-4 mt-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg font-bold leading-none">+</span>
                    </div>
                  </div>

                  {/* 하단 탭바 */}
                  <div className="absolute bottom-3 left-2 right-2">
                    <div className="bg-white rounded-2xl px-4 py-2 flex justify-around shadow border border-slate-100">
                      {[
                        { icon: '💬', label: '문자전송' },
                        { icon: '🗂', label: '보관함' },
                        { icon: '📍', label: '설정' },
                      ].map((t) => (
                        <div key={t.label} className="flex flex-col items-center gap-0.5">
                          <span className="text-sm">{t.icon}</span>
                          <span className="text-[6px] text-slate-400">{t.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 배경 글로우 */}
              <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-2xl -z-10" />
            </div>
          </div>

          {/* 우측: 텍스트 + 3단계 */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">No Download Required</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
              PC 브라우저, 스마트폰에서도<br />
              <span className="text-amber-400">단 한 번의 입력으로</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              앱 스토어도, 다운로드도 필요 없습니다.<br />
              스마트폰 브라우저에서{' '}
              <span className="text-amber-300 font-bold">app.sojangnote.com</span>만 입력하면 끝입니다.
            </p>

            {/* 3단계 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  num: '01',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect x="5" y="2" width="14" height="20" rx="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3"/>
                    </svg>
                  ),
                  title: '모바일 브라우저 열기',
                  desc: 'iOS Safari, Android Chrome 모두 가능',
                },
                {
                  num: '02',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="16" rx="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="8" y1="4" x2="8" y2="9"/>
                      <line x1="16" y1="4" x2="16" y2="9"/>
                    </svg>
                  ),
                  title: '주소 입력',
                  desc: 'app.sojangnote.com 을 주소창에 입력',
                },
                {
                  num: '03',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ),
                  title: '즉시 사용',
                  desc: '네이티브 앱처럼 부드럽게 작동',
                },
              ].map((step) => (
                <div key={step.num}
                  className="bg-white/5 border border-white/10 rounded-2xl px-5 py-5 flex flex-col items-center lg:items-start gap-3 hover:bg-white/8 transition-colors">
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-blue-400 text-xs font-black tracking-widest">{step.num}</span>
                    <div className="flex-1 h-px bg-blue-500/30" />
                  </div>
                  <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-400">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-1">{step.title}</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
