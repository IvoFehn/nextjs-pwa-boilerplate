// public/sw.js
// Statische Assets zum Precaching
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/android-chrome-192x192.png",
  "/favicon-32x32.png",
];

const PRECACHE = "precache-v1";
const RUNTIME_CACHE = "runtime-v1";

// Service Worker Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(self.skipWaiting())
  );
});

// Service Worker Aktivierung
self.addEventListener("activate", (event) => {
  const currentCaches = [PRECACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Push-Notifications Event Handling
self.addEventListener("push", (event) => {
  const payload = event.data?.json() || {
    title: "Neue Benachrichtigung",
    body: "Es gibt neue Updates!",
    icon: "/android-chrome-192x192.png",
    link: "/",
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/android-chrome-192x192.png",
      badge: "/favicon-32x32.png",
      data: payload.link || "/",
    })
  );
});

// Notification-Click Handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const targetUrl = event.notification.data || "/";

      // Versuchen, ein bereits offenes Fenster zu fokussieren
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }

      // Wenn kein passendes Fenster gefunden, neues Fenster öffnen
      return clients.openWindow(targetUrl);
    })
  );
});

// Fetch-Handling für Caching
self.addEventListener("fetch", (event) => {
  // Nur GET-Requests cachen
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Cache First, dann Network
      if (cachedResponse) {
        // Sofortige Antwort aus Cache + Update im Hintergrund
        event.waitUntil(fetchAndCache(event.request));
        return cachedResponse;
      }

      // Kein Cache -> Network + Caching
      return fetchAndCache(event.request);
    })
  );
});

// Hilfsfunktion für Fetch + Caching
function fetchAndCache(request) {
  return fetch(request)
    .then((fetchResponse) => {
      const cacheControl = fetchResponse.headers.get("cache-control");
      const shouldCache = !cacheControl || !cacheControl.includes("no-store");
      const isHttp = request.url.startsWith("http");

      if (shouldCache && isHttp && fetchResponse.status === 200) {
        const responseToCache = fetchResponse.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
      }
      return fetchResponse;
    })
    .catch(() => {
      // Fallback für Offline-Modus
      return (
        caches.match("/offline.html") ||
        new Response("Offline", { status: 200 })
      );
    });
}
