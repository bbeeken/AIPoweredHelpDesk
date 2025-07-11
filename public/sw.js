const CACHE_NAME = 'helpdesk-v1';
const FILES = [
  '/',
  '/index.html',
  '/chat.html',
  '/styles.css'
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

