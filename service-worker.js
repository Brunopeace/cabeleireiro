// ==============================
// 🔥 CLAUDIO STYLE - SERVICE WORKER
// ==============================

// Nome do cache (mude o número da versão quando alterar o app)
const CACHE_NAME = "claudio-style-v2"; // ⬅️ altere o número sempre que fizer grandes mudanças

// Arquivos essenciais para o funcionamento offline
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/js/script.js",
  "/manifest.json",
  "/css/styles.css",
  "/img/icon-192.png",
  "/img/icon-512.png"
];

// ==============================
// 🧱 INSTALAÇÃO DO SERVICE WORKER
// ==============================
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("📁 Armazenando arquivos no cache...");
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch((err) => console.error("❌ Falha ao armazenar arquivos no cache:", err))
  );

  self.skipWaiting(); // força ativação imediata
});

// ==============================
// 🚀 ATIVAÇÃO DO SERVICE WORKER
// ==============================
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker ativado!");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Removendo cache antigo:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim(); // assume o controle imediato das páginas
});

// ==============================
// 🌐 INTERCEPTAÇÃO DE REQUISIÇÕES
// ==============================
self.addEventListener("fetch", (event) => {
  // Ignora requisições externas (ex: APIs, Firebase, etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// ==============================
// ⚡ FUNÇÃO PARA ATUALIZAR CACHE EM SEGUNDO PLANO
// ==============================
async function atualizarCacheEmSegundoPlano(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
    console.log("♻️ Cache atualizado:", request.url);
  } catch (error) {
    console.warn("⚠️ Falha ao atualizar cache:", request.url);
  }
}