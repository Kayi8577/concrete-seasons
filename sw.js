/* Concrete Seasons — service worker.
   Cache-first so the game is fully playable offline / in airplane mode.
   Bump CACHE_VERSION on every release so clients pick up new files. */
const CACHE_VERSION = 'cs-v2';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/data2.js',
  './js/art.js',
  './js/engine.js',
  './js/game.js',
  './js/ui.js',
  './js/main.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network-first, cache fallback: online players always get the newest build,
   offline players (airplane mode) get the last cached one. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
