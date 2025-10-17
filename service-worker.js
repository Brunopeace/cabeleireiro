// Nome do cache (mude a versão se atualizar o app)
const CACHE_NAME = "claudio-style-v1";

// Lista de arquivos que serão armazenados em cache
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "/css/style.css",
  "/img/icon-192.png",
  "/img/icon-512.png"
];

// Instala o service worker e adiciona os arquivos ao cache
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker instalado");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativa o service worker e limpa caches antigos
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker ativado");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          console.log("🧹 Limpando cache antigo:", key);
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

// Intercepta requisições e serve arquivos do cache quando offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});