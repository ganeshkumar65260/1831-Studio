// 1831 Studio - Service Worker

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
);

const CACHE = "1831-studio-v1";
const offlineFallbackPage = "./offline.html";

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      try {
        await cache.add(offlineFallbackPage);
      } catch (error) {
        console.log("Offline page cache failed:", error);
      }
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        const preloadResponse = await event.preloadResponse;

        if (preloadResponse) return preloadResponse;

        return await fetch(event.request);
      } catch (error) {
        const cache = await caches.open(CACHE);
        return (
          (await cache.match(offlineFallbackPage)) ||
          new Response("1831 Studio is offline. Please reconnect to the internet.", {
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          })
        );
      }
    })()
  );
});
     
