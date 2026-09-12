const CACHE_NAME = 'learning-pwa-v0.4.7';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './korean-v04.js',
  './korean-voice-v04.js',
  './korean-voice-ui-v04.js',
  './korean-content-v04.js',
  './v04-boot.js',
  './v04-schema-align.js',
  './learner-data-v1.js',
  './app.js',
  './cards.js',
  './platform-data.js',
  './assets/retail-spatial-case-01.svg',
  './manifest.webmanifest',
  './icon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        const cacheable = url.origin === self.location.origin || url.hostname === 'cdn.jsdelivr.net';
        if (cacheable && response.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
