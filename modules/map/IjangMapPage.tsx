'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ── Kakao Maps SDK 전역 타입 최소 선언 ── */
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (cb: () => void) => void;
        Map: new (container: HTMLElement, options: object) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: object) => KakaoMarker;
        CustomOverlay: new (options: object) => void;
        event: { addListener: (target: object, type: string, handler: () => void) => void };
      };
    };
  }
}
interface KakaoMap    { setCenter(latlng: KakaoLatLng): void; }
interface KakaoLatLng { getLat(): number; getLng(): number; }
interface KakaoMarker { setMap(map: KakaoMap | null): void; setPosition(latlng: KakaoLatLng): void; }

const APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? '';

function loadKakaoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptSrc = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${APP_KEY}&autoload=false`;
    console.log('[KAKAO] loadKakaoScript 시작');
    console.log('[KAKAO] APP_KEY:', APP_KEY ? `${APP_KEY.slice(0, 6)}...` : '(없음)');
    console.log('[KAKAO] 스크립트 URL:', scriptSrc);

    if (window.kakao?.maps) {
      console.log('[KAKAO] window.kakao.maps 이미 존재 → 바로 resolve');
      resolve();
      return;
    }

    const existing = document.getElementById('kakao-map-sdk');
    if (existing) {
      console.log('[KAKAO] 기존 script 태그 발견, load/error 이벤트 대기');
      existing.addEventListener('load', () => { console.log('[KAKAO] 기존 script onload'); resolve(); });
      existing.addEventListener('error', (e) => { console.error('[KAKAO] 기존 script onerror', e); reject(e); });
      return;
    }

    const s = document.createElement('script');
    s.id  = 'kakao-map-sdk';
    s.src = scriptSrc;
    s.async = true;
    s.onload  = () => { console.log('[KAKAO] script onload 완료'); resolve(); };
    s.onerror = (e) => {
      console.error('[KAKAO] script onerror — 스크립트 로드 실패', e);
      console.error('[KAKAO] 원인 가능성: 1) 앱키 오류  2) 도메인 미등록  3) 네트워크 차단');
      reject(new Error('script_load_fail'));
    };
    console.log('[KAKAO] script 태그 head에 추가');
    document.head.appendChild(s);
  });
}

export default function IjangMapPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<KakaoMap | null>(null);
  const markerRef    = useRef<KakaoMarker | null>(null);

  const [mapReady,      setMapReady]      = useState(false);
  const [loadError,     setLoadError]     = useState<string | null>(null);
  const [locating,      setLocating]      = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  /* ── 내 위치로 지도 이동 ── */
  const moveToMyLocation = useCallback(() => {
    if (!mapRef.current) return;
    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 GPS를 지원하지 않습니다.');
      return;
    }
    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        console.log('[KAKAO] geolocation 성공 — lat:', lat, 'lng:', lng);
        const latlng = new window.kakao.maps.LatLng(lat, lng);

        // 지도 중심 이동
        mapRef.current!.setCenter(latlng);

        // 기존 마커 제거 후 새 마커 생성
        if (markerRef.current) {
          markerRef.current.setMap(null);
          console.log('[KAKAO] 이전 마커 제거');
        }
        markerRef.current = new window.kakao.maps.Marker({
          position: latlng,
          map: mapRef.current as any,
        });
        console.log('[KAKAO] Marker 생성 완료 — lat:', lat, 'lng:', lng);
        setLocating(false);
      },
      (err) => {
        console.error('[KAKAO] geolocation 실패 — code:', err.code, 'message:', err.message);
        console.error('[KAKAO] code 의미: 1=권한거부 2=위치불가 3=타임아웃');
        setLocating(false);
        if (err.code === 1) setLocationError('위치 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.');
        else                setLocationError('현재 위치를 가져올 수 없습니다. 다시 시도해 주세요.');
      },
      { timeout: 10_000, maximumAge: 30_000, enableHighAccuracy: true }
    );
  }, []);

  /* ── 지도 초기화 ── */
  useEffect(() => {
    console.log('[KAKAO] useEffect 진입');
    console.log('[KAKAO] APP_KEY 존재 여부:', !!APP_KEY);

    if (!APP_KEY) {
      console.error('[KAKAO] APP_KEY 없음 → no_key 에러');
      setLoadError('no_key');
      return;
    }

    let cancelled = false;
    loadKakaoScript()
      .then(() => {
        console.log('[KAKAO] script 로드 완료');
        console.log('[KAKAO] window.kakao 존재:', !!window.kakao);
        console.log('[KAKAO] window.kakao.maps 존재:', !!window.kakao?.maps);
        return new Promise<void>((res) => window.kakao.maps.load(res));
      })
      .then(() => {
        console.log('[KAKAO] kakao.maps.load() 콜백 실행 완료');
        if (cancelled || !containerRef.current) {
          console.warn('[KAKAO] cancelled 또는 containerRef 없음 → 지도 초기화 중단');
          return;
        }
        const DEFAULT = new window.kakao.maps.LatLng(37.5665, 126.9780); // 서울 시청
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: DEFAULT,
          level: 6,
        });
        console.log('[KAKAO] Map 생성 성공');
        setMapReady(true);
      })
      .catch((err) => {
        console.error('[KAKAO] 지도 로드 실패:', err);
        console.error('[KAKAO] window.kakao:', window.kakao);
        if (!cancelled) setLoadError('load_fail');
      });

    return () => { cancelled = true; };
  }, []);

  /* 지도 준비 후 자동으로 현재 위치 요청 */
  useEffect(() => {
    if (mapReady) moveToMyLocation();
  }, [mapReady, moveToMyLocation]);

  /* ── API 키 없음 안내 ── */
  if (loadError === 'no_key') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50 px-8 text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-slate-800 text-[15px] mb-1">카카오맵 API 키 필요</p>
          <p className="text-slate-500 text-[13px] leading-relaxed">
            임장 지도를 사용하려면<br/>카카오 API 키 등록이 필요합니다.
          </p>
        </div>
        <div className="w-full bg-slate-100 rounded-xl px-4 py-3 text-left">
          <p className="text-[11px] font-bold text-slate-500 mb-1.5">📄 .env.local에 추가</p>
          <code className="text-[11px] text-brand-600 font-mono break-all">
            NEXT_PUBLIC_KAKAO_MAP_APP_KEY=발급받은키
          </code>
        </div>
        <a
          href="https://developers.kakao.com/"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[12px] text-brand-600 font-semibold"
        >
          카카오 Developers에서 키 발급받기
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    );
  }

  /* ── 스크립트 로드 실패 ── */
  if (loadError === 'load_fail') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-slate-50 px-8 text-center">
        <svg className="w-12 h-12 text-red-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="font-bold text-slate-700">지도를 불러올 수 없습니다</p>
        <p className="text-slate-500 text-[13px]">네트워크를 확인하고 새로고침해 주세요.</p>
        <button onClick={() => window.location.reload()} className="mt-1 px-5 py-2.5 bg-brand-500 text-white text-[13px] font-bold rounded-xl hover:bg-brand-600 transition-colors">
          새로고침
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col relative overflow-hidden">

        {/* 지도 컨테이너 */}
        <div ref={containerRef} className="flex-1 w-full" />

        {/* 초기 로딩 오버레이 */}
        {!mapReady && (
          <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-slate-500">지도를 불러오는 중...</p>
          </div>
        )}

        {/* 현재 위치 버튼 */}
        {mapReady && (
          <button
            onClick={moveToMyLocation}
            disabled={locating}
            className="absolute right-4 bottom-5 w-12 h-12 bg-white shadow-lg rounded-2xl flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-60 z-10"
            title="현재 위치로 이동"
          >
            {locating ? (
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
                <path d="M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>
              </svg>
            )}
          </button>
        )}

        {/* 위치 오류 토스트 */}
        {locationError && mapReady && (
          <div className="absolute bottom-20 left-4 right-4 bg-white border border-amber-200 rounded-xl px-4 py-3 shadow-lg flex items-start gap-2.5 z-10">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div className="flex-1">
              <p className="text-[12px] text-slate-700 leading-relaxed">{locationError}</p>
            </div>
            <button onClick={() => setLocationError(null)} className="text-slate-300 hover:text-slate-500 text-[14px] leading-none flex-shrink-0">✕</button>
          </div>
        )}
      </div>
    </>
  );
}
