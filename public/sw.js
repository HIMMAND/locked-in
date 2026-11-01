const CACHE = "locked-in-public-v3";
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then(async (cache) => {
        const response = await fetch("/offline.html");
        if (!response.ok) throw new Error("Offline page unavailable");
        // Workers Assets may redirect .html URLs. Store a fresh response so a
        // redirected response is never returned to a navigation in offline mode.
        await cache.put("/offline.html", new Response(await response.text(), {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }));
        await cache.add("/icon.svg");
      })
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("locked-in-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate")
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html")),
    );
});
