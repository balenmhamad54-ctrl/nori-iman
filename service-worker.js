const CACHE_NAME = "nuri-iman-pwa-v17";
const CACHE_PREFIX = "nuri-iman-pwa-";
const CORE_FILES = [
  "./",
  "./app-shell.js",
  "./prayer-time-core.js",
  "./prayer-time-service.js",
  "./prayer-timetable-activation.js",
  "./bang-kurdistan-adapter.js",
  "./bang-community-2026.js",
  "./bang-community-2026.json",
  "./BANG_LICENSE_ORIGINAL.txt",
  "./prayer-timetables.json",
  "./prayer-timetable-approvals.json",
  "./city-catalog.json",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./balen.jpg",
  "./boss.jpeg",
  "./about.html",
  "./acadimyayislam.html",
  "./chirokPexambaran.html",
  "./dastnwezh.html",
  "./du3a.html",
  "./dua.html",
  "./duayDastpek.html",
  "./ebadat.html",
  "./ferbwni-nwez.html",
  "./hadith.html",
  "./index.html",
  "./jorakanynwezh.html",
  "./katakanyBang.html",
  "./mezhuwi-islam.html",
  "./naw.html",
  "./nawPexambaran.html",
  "./nwezh.html",
  "./nyatwDastnwezh.html",
  "./payekaniBawar.html",
  "./qiblanma.html",
  "./quiz.html",
  "./quran.html",
  "./takbirwDastpekrdnyNwezh.html",
  "./talaq.html",
  "./taqweem.html",
  "./tasbih.html",
  "./website.html",
  "./zakat.html",
  "./zhyanyRozhana.html",
  "./zikrBaynyan.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // Keep the previous worker if any core page or timetable cannot be cached.
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  async function remember(response) {
    if (response && response.ok) {
      try { const cache = await caches.open(CACHE_NAME); await cache.put(request, response.clone()); }
      catch (error) { /* A failed cache write must not hide a valid network response. */ }
    }
    return response;
  }

  // Google Fonts: cache so the app keeps its fonts offline.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(remember))
    );
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Pages and scripts: network first so updates appear, cache when offline.
  const navigation = request.mode === "navigate";
  const networkFirst = navigation || /\.(html|js|json|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/");
  if (networkFirst) {
    event.respondWith(
      fetch(request).then(remember).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (navigation) {
          const home = await caches.match("./index.html");
          if (home) return home;
        }
        return new Response("Offline resource unavailable", { status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" } });
      })
    );
    return;
  }

  // Images and other assets: cache first.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(remember);
    })
  );
});
