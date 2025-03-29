self.addEventListener("fetch", (event) => {
  // Ignoriere POST-Anfragen beim Caching
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Wenn eine gecachte Antwort existiert, geben wir sie zurück
      if (cachedResponse) {
        return cachedResponse;
      }
      // Andernfalls fetchen wir die Ressource vom Netzwerk
      return fetch(event.request).then((fetchResponse) => {
        // Prüfen, ob die Antwort gemäß cache-control gespeichert werden darf
        const cacheControl = fetchResponse.headers.get("cache-control");
        const shouldCache = !cacheControl || !cacheControl.includes("no-store");
        // Prüfen, ob das Schema der Anfrage unterstützt wird (nur http oder https)
        const isHttp =
          event.request.url.startsWith("http://") ||
          event.request.url.startsWith("https://");

        if (shouldCache && isHttp) {
          // Nur cachen, wenn kein no-store vorhanden ist UND das Schema http/https ist
          return caches.open("cat-spray-cache").then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        } else {
          // Antwort nicht cachen, direkt zurückgeben
          return fetchResponse;
        }
      });
    })
  );
});
