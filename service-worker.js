const CACHE_NAME = "nuri-iman-pwa-v4";
const CORE_FILES = [
  "./",
  "./app-shell.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
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
      .then(cache => Promise.allSettled(CORE_FILES.map(f => cache.add(f))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Google Fonts: cache so the app keeps its fonts offline.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => cached))
    );
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Pages and scripts: network first so updates appear, cache when offline.
  const networkFirst = request.mode === "navigate" || /\.(html|js|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/");
  if (networkFirst) {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() =>
        caches.match(request).then(cached => cached || caches.match("./index.html"))
      )
    );
    return;
  }

  // Images and other assets: cache first.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
