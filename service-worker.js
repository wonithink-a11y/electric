// service-worker.js
// 전기설비 업무앱 오프라인 캐싱용 서비스워커

const CACHE_NAME = 'jeonbi-app-v1'; // 파일 내용 크게 바꿀 때마다 v1 -> v2로 올려주세요 (안 올리면 캐시가 안 갱신됨)
const urlsToCache = [
  './app32.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 설치: 핵심 파일 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// 활성화: 이전 버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 요청 가로채기: 캐시 우선, 없으면 네트워크, 네트워크도 실패하면 캐시된 이전 버전 반환
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
