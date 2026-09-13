const CACHE_NAME = 'learning-pwa-v0.6.4';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './korean-v04.js',
  './korean-voice-v04.js',
  './korean-voice-ui-v04.js',
  './korean-content-v04.js',
  './korean-lesson-content-v05.js',
  './korean-learning-ui-v05.js',
  './korean-assessment-data-v05.js',
  './korean-assessment-ui-v05.js',
  './v04-boot.js',
  './v04-schema-align.js',
  './learner-data-v1.js',
  './lesson-content-v05.js',
  './learning-ui-v05.js',
  './mobile-domain-grid-v051.js',
  './official-visual-gallery-v051.js',
  './lesson-official-visuals-v052.js',
  './pura90-variant-gallery-v06.js',
  './app.js',
  './cards.js',
  './platform-data.js',
  './assets/retail-spatial-case-01.svg',
  './assets/official/pura90/pura90_roland-purple.png',
  './assets/official/pura90/pura90_snow-white.png',
  './assets/official/pura90/pura90_velvet-black.png',
  './assets/official/pura90/pura90pro_pink-guava.png',
  './assets/official/pura90/pura90pro_orange-soda.png',
  './assets/official/pura90/pura90pro_coconut-white.png',
  './assets/official/pura90/pura90pro_mulberry-black.png',
  './assets/official/pura90/pura90promax_orange-sea.png',
  './assets/official/pura90/pura90promax_glow-purple.png',
  './assets/official/pura90/pura90promax_jade-lake.png',
  './assets/official/pura90/pura90promax_dawn-gold.png',
  './assets/official/pura90/pura90promax_obsidian-black.png',
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
