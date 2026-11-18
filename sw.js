
const CACHE_NAME = "messintina-fc-v1";

const FILES = [
  "./",
  "./index.html",
  "./game.html",
  "./manifest.json",
  "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const file of FILES) {
        try {
          await cache.add(file);
        } catch (error) {
          console.log("Cache failed:", file, error);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, copy)
          );
        }
        return response;
      });
    })
  );
});
          
