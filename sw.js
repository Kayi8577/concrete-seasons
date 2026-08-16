/* Concrete Seasons — service worker.
   Cache-first so the game is fully playable offline / in airplane mode.
   Bump CACHE_VERSION on every release so clients pick up new files. */
const CACHE_VERSION = 'cs-v24';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data/core.js',
  './js/data/world.js',
  './js/data/economy.js',
  './js/data/npcs.js',
  './js/data/schedules.js',
  './js/data/dialogue.js',
  './js/data/festivals.js',
  './js/data/arcs.js',
  './js/audio.js',
  './js/art.js',
  './js/engine.js',
  './js/game.js',
  './js/ui.js',
  './js/main.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './assets/roguelike.png',
  './assets/buildings/bakery.png',
  './assets/buildings/cafe.png',
  './assets/buildings/market.png',
  './assets/buildings/pub.png',
  './assets/buildings/thrift.png',
  './assets/buildings/glasshouse.png',
  './assets/buildings/apartment.png',
  './assets/buildings/harborhouse.png',
  './assets/buildings/greenhouse.png',
  './assets/buildings/labs.png',
  './assets/buildings/bellinis.png',
  './assets/buildings/teahouse.png',
  './assets/buildings/mott.png',
  './assets/buildings/foodcourt.png',
  './assets/buildings/boba.png',
  './assets/buildings/wcafe.png',
  './assets/buildings/wflea.png',
  './assets/portraits/maya.png',
  './assets/portraits/daniel.png',
  './assets/portraits/lena.png',
  './assets/portraits/nico.png',
  './assets/portraits/grace.png',
  './assets/portraits/malik.png',
  './assets/portraits/joan.png',
  './assets/portraits/rosa.png',
  './assets/portraits/mrs_woo.png',
  './assets/portraits/sofia.png',
  './assets/portraits/gabriel.png',
  './assets/portraits/theo.png',
  './assets/portraits/avery.png',
  './assets/portraits/naomi.png',
  './assets/portraits/arjun.png',
  './assets/portraits/priya.png',
  './assets/portraits/jordan.png',
  './assets/portraits/mei_lin.png',
  './assets/portraits/mateo.png',
  './assets/portraits/ava.png',
  './assets/portraits/nia.png',
  './assets/portraits/claire.png',
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
    // no-cache: always revalidate with the server when online (avoids the
    // browser's heuristic HTTP cache serving stale JS); offline falls back
    // to the last cached copy.
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
