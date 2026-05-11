const CACHE_NAME = 'studybuddy-v2.0';
const ASSETS = ['./index.html', './manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE_NAME).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request).then(c => { const f = fetch(e.request).then(r => { if (r && r.status === 200) { const clone = r.clone(); caches.open(CACHE_NAME).then(ca => ca.put(e.request, clone)); } return r; }).catch(() => c); return c || f; })); });
