// Service worker de ComparaProfeco.
// Sólo guarda en el dispositivo las páginas y recursos PROPIOS (mismo origen).
// Nunca cachea APIs ni peticiones a terceros (datos, imágenes o QR externos):
// así no se conserva nada que deba venir fresco ni se guarda tráfico ajeno.
const CACHE = "comparaprofeco-v6";
const CORE = ["/", "/explorar", "/instalar", "/fuentes", "/privacidad", "/manifest.json", "/icon.svg"];

const propio = (req) => new URL(req.url).origin === self.location.origin;
const esApi = (req) => new URL(req.url).pathname.startsWith("/api/");

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !propio(req) || esApi(req)) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === "basic") {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/")))
  );
});
