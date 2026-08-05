const CACHE_NAME = 'lift-tracker-v6';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const isNavigate = e.request.mode === 'navigate';

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Stale-while-revalidate: serve the cached shell immediately and
      // refresh it in the background, so offline never blocks the UI.
      const refresh = fetch(e.request)
        .then(r => {
          if (r && r.ok) {
            const clone = r.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            if (cached && isNavigate) {
              Promise.all([cached.text(), r.clone().text()]).then(([oldText, newText]) => {
                if (oldText !== newText) {
                  clients.matchAll({type: 'window', includeUncontrolled: true}).then(wins => {
                    wins.forEach(w => w.postMessage({type: 'APP_UPDATE'}));
                  });
                }
              }).catch(() => {});
            }
          }
          return r;
        })
        .catch(() => cached || caches.match('./index.html'));
      return cached || refresh;
    })
  );
});
