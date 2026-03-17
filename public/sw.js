// HomeoClinic Pro — Service Worker v2
const CACHE_NAME = "homeoclinic-v2";
const API_CACHE = "homeoclinic-api-v1";

const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.svg",
  "/offline.html",
];

// API routes to cache (stale-while-revalidate)
const CACHEABLE_API = [
  "/api/repertory/chapters",
  "/api/repertory/remedies",
  "/api/repertory/miasms",
];

// Install: cache static assets + offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip auth routes — always go to network
  if (url.pathname.startsWith("/login") || url.pathname.startsWith("/register")) {
    return;
  }

  // Cacheable API routes: stale-while-revalidate
  if (CACHEABLE_API.some((path) => url.pathname.startsWith(path))) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);

          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Other API routes with recent cache (appointments, patients)
  if (url.pathname.startsWith("/api/appointments") || url.pathname.startsWith("/api/patients")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.open(API_CACHE).then((cache) => cache.match(request)))
    );
    return;
  }

  // Other API routes — network only
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Static assets (icons, manifest, _next): cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json" ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
      )
    );
    return;
  }

  // App pages: network-first with offline fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) =>
          cached || caches.match("/offline.html")
        )
      )
  );
});
