const CACHE_NAME = 'bluey-soundboard-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/bluey.png',
  '/bingo.png',
  '/bandit.png',
  '/chilli.png',
  '/muffin.png',
  '/icon-192.png',
  '/icon-512.png',
  '/api/zones' // cache the coordinates so it works offline
];

// Install Event: cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all static assets');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clear old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache first, fallback to network
self.addEventListener('fetch', (e) => {
  // Skip caching API requests that aren't GET or external media, but cache zones.json
  if (e.request.method !== 'GET') {
    return e.respondWith(fetch(e.request));
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(e.request).then((response) => {
        // Don't cache media files (like mp3/mp4) in static cache automatically to avoid blowing up memory,
        // but let them load normally.
        const isMedia = e.request.url.match(/\.(mp3|mp4)$/i);
        if (isMedia || !response || response.status !== 200) {
          return response;
        }

        // Cache newly loaded page assets dynamically
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return response;
      });
    })
  );
});
