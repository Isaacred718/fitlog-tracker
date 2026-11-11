const CACHE_NAME = 'lift-tracker-v9';
const ASSETS = ['./index.html', './manifest.json', './auth.html', './fonts/nunito.woff2'];

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
    // Only this app's old caches: other apps on the same site keep theirs.
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('lift-tracker-') && k !== CACHE_NAME).map(k => caches.delete(k))))
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
    e.respondWith(fetch(e.request).catch(() => {
      // The app-shell fallback is only valid for navigations. Returning
      // index.html for a failed script request makes the browser parse
      // HTML as JavaScript ("Unexpected token '<'") and can break the
      // Firebase SDK load entirely.
      if (isNavigate) return caches.match('./index.html');
      return new Response('', { status: 504, statusText: 'Offline' });
    }));
    return;
  }

  // Navigations (including OAuth return to index.html) must hit the network
  // so a stale cached shell can't drop the Google handoff.
  if (isNavigate) {
    e.respondWith(
      fetch(e.request)
        .then(async r => {
          if (r && r.ok) {
            const clone = r.clone();
            try {
              const cache = await caches.open(CACHE_NAME);
              const old = await cache.match(e.request);
              if (old) {
                // The update notification used to live in the
                // stale-while-revalidate branch under a condition that
                // could never be true there, so it never fired. Compare
                // here, where a fresh navigation response actually lands.
                const [oldText, newText] = await Promise.all([old.text(), r.clone().text()]);
                if (oldText !== newText) {
                  const wins = await clients.matchAll({ type: 'window', includeUncontrolled: true });
                  wins.forEach(w => w.postMessage({ type: 'APP_UPDATE' }));
                }
              }
              await cache.put(e.request, clone);
            } catch (_) {}
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
          }
          return r;
        })
        .catch(() => cached || caches.match('./index.html'));
      return cached || refresh;
    })
  );
});
