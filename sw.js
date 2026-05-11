const CACHE_NAME = 'studybuddy-v3.2-' + Date.now();
const ASSETS = ['./index.html', './manifest.json'];

// Install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate - delete ALL old caches aggressively
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => {
      // Force all clients to refresh
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      });
    })
  );
  self.clients.claim();
});

// Fetch - network first
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r && r.status === 200) {
          const clone = r.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

// Listen for messages from page
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (e.data === 'clearAll') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
