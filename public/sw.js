// public/sw.js
// Statische Assets zum Precaching
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/android-chrome-192x192.png",
  "/favicon-32x32.png",
];

const PRECACHE = "precache-v2"; // Version erhöht, um Update zu erzwingen
const RUNTIME_CACHE = "runtime-v2";

// Logging-Funktion für den Service Worker
function logToScreen(message) {
  // Nachricht an alle verbundenen Clients senden
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "DEBUG_LOG",
        message: message,
      });
    });
  });

  // Auch in die Konsole loggen für Entwicklungszwecke
  console.log("[ServiceWorker]", message);
}

// Initiales Log, sobald der Service Worker geladen wird
logToScreen("Service Worker geladen (v2)");

// Listener für SKIP_WAITING Message
self.addEventListener("message", (event) => {
  logToScreen("Message empfangen: " + (event.data?.type || "unbekannt"));

  if (event.data && event.data.type === "SKIP_WAITING") {
    logToScreen("SKIP_WAITING Nachricht erhalten, führe skipWaiting aus");
    self.skipWaiting();
  }
});

// Service Worker Installation
self.addEventListener("install", (event) => {
  logToScreen("Service Worker: Install-Event ausgelöst");

  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => {
        logToScreen("Precache geöffnet, füge Assets hinzu");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        logToScreen("Precache abgeschlossen, skipWaiting");
        return self.skipWaiting(); // Immer skipWaiting aufrufen
      })
      .catch((error) => {
        logToScreen("Fehler beim Caching: " + error.message);
      })
  );
});

// Service Worker Aktivierung
self.addEventListener("activate", (event) => {
  logToScreen("Service Worker: Activate-Event ausgelöst");

  const currentCaches = [PRECACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        logToScreen("Prüfe Cache-Einträge: " + cacheNames.join(", "));
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        if (cachesToDelete.length > 0) {
          logToScreen("Lösche alte Caches: " + cachesToDelete.join(", "));
        } else {
          logToScreen("Keine alten Caches zu löschen");
        }
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => {
        logToScreen("Clients übernommen (claim)");
        return self.clients.claim(); // Clients explizit übernehmen
      })
      .catch((error) => {
        logToScreen("Fehler bei der Aktivierung: " + error.message);
      })
  );
});

// Push-Notifications Event Handling
self.addEventListener("push", (event) => {
  logToScreen("Push-Event empfangen");

  try {
    // Payload analysieren
    let payload;
    if (event.data) {
      try {
        payload = event.data.json();
        logToScreen(
          "Push-Daten als JSON empfangen: " +
            JSON.stringify(payload).substring(0, 100)
        );
      } catch (e) {
        payload = {
          title: "Neue Benachrichtigung",
          body: event.data.text(),
          icon: "/android-chrome-192x192.png",
          link: "/",
        };
        logToScreen("Push-Daten als Text empfangen: " + event.data.text());
      }
    } else {
      payload = {
        title: "Neue Benachrichtigung",
        body: "Es gibt neue Updates!",
        icon: "/android-chrome-192x192.png",
        link: "/",
      };
      logToScreen("Push-Event ohne Daten empfangen, verwende Standardwerte");
    }

    event.waitUntil(
      self.registration
        .showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/android-chrome-192x192.png",
          badge: "/favicon-32x32.png",
          data: { url: payload.link || "/" }, // Geändert für einheitliches Format
        })
        .then(() => {
          logToScreen("Benachrichtigung angezeigt");
        })
        .catch((error) => {
          logToScreen(
            "Fehler beim Anzeigen der Benachrichtigung: " + error.message
          );
        })
    );
  } catch (error) {
    logToScreen("Fehler bei der Push-Verarbeitung: " + error.message);
  }
});

// Notification-Click Handling
self.addEventListener("notificationclick", (event) => {
  logToScreen("Benachrichtigung angeklickt");

  event.notification.close();

  // Verbesserte URL-Extraktion
  const targetUrl = event.notification.data?.url || "/";
  logToScreen("Öffne URL: " + targetUrl);

  event.waitUntil(
    clients
      .matchAll({ type: "window" })
      .then((clientList) => {
        // Versuchen, ein bereits offenes Fenster zu fokussieren
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            logToScreen("Existierendes Fenster gefunden, fokussiere es");
            return client.focus();
          }
        }

        // Wenn kein passendes Fenster gefunden, neues Fenster öffnen
        logToScreen("Kein passendes Fenster gefunden, öffne neues Fenster");
        return clients.openWindow(targetUrl);
      })
      .catch((error) => {
        logToScreen("Fehler beim Öffnen des Fensters: " + error.message);
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
