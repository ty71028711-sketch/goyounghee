// ──────────────────────────────────────────────
// 임장메이트 PRO · Service Worker
// 역할: 앱 셸(shell) 캐싱 → 오프라인 시 기본 화면 표시
// ──────────────────────────────────────────────

const CACHE_NAME = 'imjangmate-pro-v2';

// 오프라인에서도 보여줄 최소 자원 목록
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

// ── 설치: 최초 1회 → 핵심 자원 캐시에 저장 ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── 활성화: 구버전 캐시 정리 ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── 네트워크 요청 처리 전략: Network First → 실패 시 Cache ──
// Firebase 인증/Firestore 요청은 캐시하지 않음 (항상 네트워크)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Firebase / 외부 API 요청은 캐시 없이 그대로 통과
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('google') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('firestore') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // 페이지 탐색 요청: Network First → 실패 시 캐시된 루트 반환
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() =>
          caches.match('/').then(res => res || new Response('오프라인 상태입니다.', { status: 503 }))
        )
    );
    return;
  }

  // 정적 자원: Cache First → 없으면 네트워크
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // 성공 응답만 캐시에 저장
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
