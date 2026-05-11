// StudyBuddy v3.3 — Force fresh cache
const CACHE_NAME = 'studybuddy-v3.3-final';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  // Delete ALL existing caches immediately
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
    .then(() => caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (k !== CACHE_NAME) return caches.delete(k);
    })))
    .then(() => self.clients.claim())
    .then(() => self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage({type:'RELOAD'}));
    }))
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.status === 200) {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return r;
    }).catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', e => {
  if (e.data === 'CLEAR_ALL') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
