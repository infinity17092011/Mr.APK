// Mr.Heart service worker: caches the app shell and images so it opens fast and works offline.
// API calls, Supabase and PayPal are cross-origin, so they are never cached.
const V = 'mh-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/heart-awake.png', '/heart-sleepy.png', '/heart-bed.png',
  '/badge-committed-silver.webp', '/badge-committed-fire.webp', '/badge-champion.webp', '/badge-legend.webp'];

self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate') {            // pages: network first, cached copy if offline
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('/index.html', cp)); return res; }).catch(() => caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
});
