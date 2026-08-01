const CACHE_NAME = 'webgames-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith('webgames-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

function shouldCache(response) {
  return response.ok && response.type !== 'opaque';
}

function cacheResponse(request, response) {
  if (!shouldCache(response) || !request.url.startsWith(self.location.origin)) return;
  const clone = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          cacheResponse(event.request, response);
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        cacheResponse(event.request, response);
        return response;
      });
    })
  );
});
