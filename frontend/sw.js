// Service Worker for cache busting
const CACHE_VERSION = 'v' + new Date().getTime();
const CACHE_NAME = 'devops-app-' + CACHE_VERSION;
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js'
];

self.addEventListener('install', (event) => {
  // Skip waiting and claim clients immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always fetch from network, no caching
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).catch(() => {
      // If offline, try cache as fallback
      return caches.match(event.request);
    })
  );
});
