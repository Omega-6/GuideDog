const CACHE = 'guidedog-v1';
const CDN_CACHE = 'guidedog-cdn-v1';

// App shell resources
const APP_SHELL = ['/GuideDog/', '/GuideDog/index.html', '/GuideDog/manifest.json'];

// Pinned CDN scripts — cached for offline use
const CDN_SCRIPTS = [
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js'
];

self.addEventListener('install', e => {
    e.waitUntil(
        Promise.all([
            caches.open(CACHE).then(c => c.addAll(APP_SHELL)),
            caches.open(CDN_CACHE).then(c => c.addAll(CDN_SCRIPTS))
        ]).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    // Remove stale caches from previous versions
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE && k !== CDN_CACHE).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const url = e.request.url;

    // Never intercept cloud AI requests — always go to network
    if (url.includes('workers.dev')) return;

    // CDN scripts: serve from cache, update in background if network available
    if (url.includes('cdn.jsdelivr.net')) {
        e.respondWith(
            caches.open(CDN_CACHE).then(c =>
                c.match(e.request).then(r => r || fetch(e.request).then(res => {
                    c.put(e.request, res.clone());
                    return res;
                }))
            )
        );
        return;
    }

    // App shell: cache-first, fall back to network
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request))
    );
});
