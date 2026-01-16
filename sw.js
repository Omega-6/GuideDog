const CACHE = 'bg-v6';
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/'])).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
    if (e.request.url.includes('workers.dev') || e.request.url.includes('cdn.')) return;
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
