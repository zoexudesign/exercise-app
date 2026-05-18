const CACHE_NAME = 'exercise-v4';
const ASSETS = [
    './',
    './index.html',
    './icon-192.png',
    './manifest.json'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' })))
        )
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;

    e.respondWith(
        fetch(e.request).then(response => {
            const requestUrl = new URL(e.request.url);
            if (requestUrl.origin === self.location.origin && response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
            }
            return response;
        }).catch(() => caches.match(e.request))
    );
});
