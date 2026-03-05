/* 임장메이트 PRO - Service Worker (오프라인 지원) */
const CACHE_NAME = 'imjangmate-pro-v1';

/* 캐시할 파일 목록 */
const PRECACHE_URLS = [
  './index.html',
  './manifest.json',
  './icon.svg',
];

/* 설치: 파일 사전 캐시 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

/* 활성화: 오래된 캐시 삭제 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

/* 요청 처리: 캐시 우선, 없으면 네트워크 */
self.addEventListener('fetch', event => {
  /* 외부 CDN 요청은 네트워크 우선으로 처리 */
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.startsWith('file://')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        /* 성공한 응답은 캐시에 저장 */
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        /* 오프라인이고 캐시도 없으면 index.html 반환 */
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
