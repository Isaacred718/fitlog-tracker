const CACHE_NAME = 'lift-tracker-v7';
const ASSETS = ['./index.html', './manifest.json', './auth.html'];

// Domains that should never be cached (auth, APIs, external resources)
const BYPASS_CACHE = [
  'accounts.google.com',
  'accounts.youtube.com',
  'oauth2.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'firebase.googleapis.com',
  'firestore.googleapis.com',
  'www.gstatic.com',
  'apis.google.com',
  'ssl.gstatic.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

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

  const url = new URL(e.request.url);
  const isNavigate = e.request.mode === 'navigate';
  const isAuthPage = url.pathname.endsWith('/auth.html');

  const shouldBypassCache = BYPASS_CACHE.some(domain => url.hostname.includes(domain));

  if (shouldBypassCache || isAuthPage) {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }

  // Navigations (including OAuth return to index.html) must hit the network
  // so a stale cached shell can't drop the Google handoff.
  if (isNavigate) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r && r.ok) {
            const clone = r.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return r;
        })
        .catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
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
