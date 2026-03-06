// c:\dev\ImjangMate_PRO_v2\public\sw.js

const CACHE_NAME = 'imjangmate-pro-v3'; // v2에서 v3로 변경

// ... (생략) ...

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            // 새 버전(v3)이 아니면 기존 캐시(v2 등)를 모두 삭제
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
