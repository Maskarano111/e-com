/**
 * NovaMart Service Worker
 * Strategy:
 *   - App shell (HTML, CSS, JS, fonts) → Cache-First (instant load)
 *   - API calls (/api/*) → Network-First with stale fallback
 *   - Images → Cache-First with background refresh
 */

const CACHE_VERSION = 'novamart-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE   = `${CACHE_VERSION}-api`;

const SHELL_URLS = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
];

// ── Install: pre-cache the app shell ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // Best-effort shell pre-cache
      return Promise.allSettled(SHELL_URLS.map((url) => cache.add(url).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: purge old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('novamart-') && !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, etc.) and browser extensions
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // API calls → Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Images (Unsplash, etc.) → Cache-First
  if (
    request.destination === 'image' ||
    url.hostname === 'images.unsplash.com' ||
    url.hostname === 'api.dicebear.com'
  ) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // App shell (HTML, JS, CSS, fonts) → Cache-First
  event.respondWith(cacheFirst(request, SHELL_CACHE));
});

// ── Strategy helpers ──────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback for HTML navigation
    if (request.mode === 'navigate') {
      const fallback = await cache.match('/');
      if (fallback) return fallback;
    }
    return new Response('Offline — NovaMart Ghana', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return (
      cached ||
      new Response(JSON.stringify({ error: 'Offline', offline: true }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }
}

// ── Push Notifications (future) ───────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'NovaMart Ghana', {
        body: data.body || 'You have a new notification',
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        data: { url: data.url || '/' },
        vibrate: [200, 100, 200],
        tag: 'novamart-notification',
      })
    );
  } catch {}
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
