'use client';

import { useState } from 'react';
import { Search, ExternalLink, Smartphone, CheckCircle2, Navigation, MousePointer2 } from 'lucide-react';

type Property = {
  id: number;
  name: string;
  price: string;
  status: string;
  x: number;
  y: number;
  naverUrl: string;
};

const sampleProperties: Property[] = [
  {
    id: 1,
    name: '옥정 중흥S클래스 에코시티',
    price: '매매 8.5억',
    status: '임장완료',
    x: 150, y: 150,
    naverUrl: 'https://land.naver.com/search/search.naver?query=옥정중흥S클래스',
  },
  {
    id: 2,
    name: '옥정 e편한세상 어반파크',
    price: '전세 3.2억',
    status: '확인중',
    x: 350, y: 250,
    naverUrl: 'https://land.naver.com/search/search.naver?query=옥정e편한세상',
  },
  {
    id: 3,
    name: '중심상가 1층 급매',
    price: '매매 12억',
    status: '계약대기',
    x: 250, y: 400,
    naverUrl: 'https://land.naver.com/search/search.naver?query=옥정중심상가',
  },
];

export default function DemoPage() {
  const [activeId, setActiveId] = useState<number | null>(null);

  const activeProperty = sampleProperties.find(p => p.id === activeId);

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1e] text-slate-200 font-sans">
      {/* 상단 안내바 */}
      <div className="bg-blue-600 text-white text-[11px] py-1.5 text-center font-bold tracking-widest uppercase">
        Experimental Sandbox Mode: Map &amp; List Interaction
      </div>

      <header className="bg-slate-900 border-b border-slate-800 p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black italic tracking-tighter">
            IMJANG MATE <span className="text-blue-400">DEMO</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 font-bold uppercase">Status</p>
          <p className="text-xs text-green-400 font-bold flex items-center gap-1 justify-end">
            <CheckCircle2 className="w-3 h-3" /> System Ready
          </p>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* 왼쪽: 목록 */}
        <div className="w-[350px] border-r border-slate-800 flex flex-col bg-slate-900/50">
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="샘플 데이터 검색..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase px-1">Property List</p>
            {sampleProperties.map(p => (
              <div
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  activeId === p.id
                    ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-blue-400 font-bold rounded border border-blue-900/30">
                    {p.status}
                  </span>
                  <p className="text-blue-400 font-bold text-sm">{p.price}</p>
                </div>
                <h3 className="font-bold text-white text-sm">{p.name}</h3>

                <div className={`mt-3 overflow-hidden transition-all duration-300 ${
                  activeId === p.id ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <button
                    onClick={e => { e.stopPropagation(); window.open(p.naverUrl, '_blank'); }}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                  >
                    네이버 부동산 열기 <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 지도 시뮬레이션 */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden">
          {/* 격자 배경 */}
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '30px 30px' }}
          />

          {/* 지도 핀 */}
          {sampleProperties.map(p => (
            <div
              key={p.id}
              className="absolute transition-all duration-500"
              style={{ left: `${p.x}px`, top: `${p.y}px` }}
            >
              <div
                onClick={() => setActiveId(p.id)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className={`px-3 py-1.5 rounded-lg text-[11px] font-black border-2 shadow-2xl transition-all ${
                  activeId === p.id
                    ? 'bg-blue-600 text-white border-white scale-110 z-20'
                    : 'bg-slate-900 text-slate-400 border-slate-700 group-hover:border-blue-500'
                }`}>
                  {p.name.split(' ')[1] || p.name}
                </div>
                <div className={`w-2.5 h-2.5 rotate-45 -mt-1.5 border-r-2 border-b-2 ${
                  activeId === p.id
                    ? 'bg-blue-600 border-white'
                    : 'bg-slate-900 border-slate-700 group-hover:border-blue-500'
                }`} />
              </div>
            </div>
          ))}

          {/* 초기 안내 */}
          {!activeId && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl text-center backdrop-blur-sm">
                <MousePointer2 className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-bounce" />
                <h2 className="text-lg font-bold text-white">동선 기반 매물 보기</h2>
                <p className="text-xs text-slate-500 mt-1">왼쪽 목록이나 지도 위의 핀을 클릭해보세요.</p>
              </div>
            </div>
          )}

          {/* 하단 플로팅 정보창 */}
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-500 ${
            activeId ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
          }`}>
            <div className="bg-slate-900 border-2 border-blue-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-6 min-w-[400px]">
              <div className="bg-blue-600/20 p-3 rounded-xl">
                <Navigation className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-blue-400 font-bold uppercase mb-0.5">Selected Property</p>
                <h3 className="text-white font-bold">{activeProperty?.name}</h3>
                <p className="text-xs text-slate-500 italic">지도의 핀을 통해 정확한 동선을 파악하세요.</p>
              </div>
              <button
                onClick={() => window.open(activeProperty?.naverUrl, '_blank')}
                className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-green-500 transition-colors"
              >
                네이버 연결 <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
