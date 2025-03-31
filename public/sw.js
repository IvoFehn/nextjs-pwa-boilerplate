// Push-Notifications Event Handling
self.addEventListener("push", (event) => {
  const payload = event.data?.json() || {
    title: "Neue Benachrichtigung",
    body: "Es gibt neue Updates!",
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/android-chrome-192x192.png",
      badge: "/favicon-32x32.png",
      data: payload.link || "/", // Für Deeplinking
    })
  );
});

// Notification-Click Handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const client = clientList.find((c) => c.url === event.notification.data);
      return client
        ? client.focus()
        : clients.openWindow(event.notification.data);
    })
  );
});

// Cache-Strategie für Fetch-Requests
self.addEventListener("fetch", (event) => {
  // Ignoriere non-GET Requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Strategie: Cache First, dann Network
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
        caches.open("medikament-planner-cache").then((cache) => {
          cache.put(request, responseToCache);
        });
      }
      return fetchResponse;
    })
    .catch(() => caches.match("/offline.html")); // Fallback für Offline-Modus
}

// Precache wichtiger Assets beim Installieren
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("medikament-planner-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/offline.html",
        "/styles/main.css",
        "/scripts/app.js",
        "/android-chrome-192x192.png",
      ]);
    })
  );
});

// Alte Caches bereinigen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== "medikament-planner-cache")
          .map((name) => caches.delete(name))
      );
    })
  );
});
