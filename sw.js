/* Service worker: guarda os arquivos do app para funcionar sem internet */
const CACHE = "rga-v5";
const ARQUIVOS = [
  "./", "index.html", "css/style.css", "js/dados.js", "js/app.js", "manifest.webmanifest",
  "img/logo-rga.png", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((chaves) =>
    Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// Tenta a internet primeiro (para pegar atualizações); sem internet, usa o cache
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp.ok && new URL(e.request.url).origin === location.origin) {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copia));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
