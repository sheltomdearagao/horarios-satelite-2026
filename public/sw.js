const CACHE_NAME = "horario-satelite-v2";
const ASSETS = ["/", "/index.html", "/manifest.webmanifest"];

// Instala imediatamente a nova versão do SW e pré-carrega os ativos fundamentais.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
});

// Assume o controle das abas e remove caches antigos (v1 etc.).
self.addEventListener("activate", (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
});

// Estratégia combinada:
// - Navegação/HTML => Network First, garantindo carregar a versão mais recente do Vite.
// - Demais arquivos => Stale-While-Revalidate (retorna cache imediato e atualiza em segundo plano).
self.addEventListener("fetch", (event) => {
  const acceptHeader = event.request.headers.get("accept") ?? "";
  const isNavigate = event.request.mode === "navigate" || acceptHeader.includes("text/html");

  if (isNavigate) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => undefined);

      return cachedResponse || fetchPromise;
    }),
  );
});