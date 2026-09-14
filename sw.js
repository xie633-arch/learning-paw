const CACHE_NAME = 'learning-pwa-v0.15.0';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './korean-v04.js',
  './korean-hangul-gate-v07.js',
  './korean-hangul-gate-compat-v071.js',
  './korean-vocab-v15.js',
  './korean-vocab-ui-v15.js',
  './korean-voice-v04.js',
  './korean-voice-ui-v04.js',
  './korean-content-v04.js',
  './korean-practice-month1-v06.js',
  './korean-exit-check-v06.js',
  './korean-completion-guard-v06.js',
  './korean-lesson-content-v05.js',
  './korean-learning-ui-v05.js',
  './korean-assessment-data-v05.js',
  './korean-assessment-ui-v05.js',
  './v04-boot.js',
  './v04-schema-align.js',
  './adaptive-metadata-v11.js',
  './learner-data-v1.js',
  './state-write-guard-v113.js',
  './formal-test-adapter-v111.js',
  './study-event-read-model-v12.js',
  './study-event-ui-v122.js',
  './learner-recommendation-v13.js',
  './recommendation-ui-v13.js',
  './lesson-content-v05.js',
  './learning-ui-v05.js',
  './retail-business-district-v14.js',
  './retail-business-district-v141.js',
  './phone-knowledge-v09.js',
  './phone-knowledge-gate-v091.js',
  './phone-knowledge-ui-v09.js',
  './phone-product-lab-v091.js',
  './phone-adaptive-v10.js',
  './phone-adaptive-note-sync-v101.js',
  './adaptive-learning-v11.js',
  './korean-stage-adaptive-v112.js',
  './today-plan-v12.js',
  './ux-v08.js',
  './visual-ui-v081.js',
  './mobile-domain-grid-v051.js',
  './official-visual-gallery-v051.js',
  './lesson-official-visuals-v052.js',
  './phone-family-variant-gallery-v07.js',
  './phone-family-pricing-v071.js',
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