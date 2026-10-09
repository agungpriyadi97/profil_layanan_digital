/**
 * ==============================================================================
 * SERVICE WORKER: PWA CACHING & OFFLINE CAPABILITIES (sw.js)
 * Portal Layanan Digital RW 01 Bencongan Indah
 * ==============================================================================
 */

const CACHE_NAME = 'rw01-portal-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js',
  './js/app.js',
  './js/models/ApiModel.js',
  './js/models/UMKMModel.js',
  './js/models/OtherModels.js',
  './js/views/UMKMView.js',
  './js/views/OtherViews.js',
  './js/controllers/UMKMController.js',
  './js/controllers/OtherControllers.js',
  './manifest.json',
  './asset/background.jpeg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA ServiceWorker]: Caching core app shell...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[PWA ServiceWorker]: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass Google Apps Script API calls directly through network
  if (event.request.url.includes('script.google.com') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update for cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Ignore offline network errors */});

        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
