// Aumente a versão (ex: v2) para forçar o navegador de quem já acessou a atualizar o cache
const CACHE_NAME = "horario-satelite-v2"; 
const ASSETS = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // Força a instalação imediata
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
});

self.addEventListener("activate", (event) => {
  self.clients.claim(); // Assume o controle das abas abertas imediatamente
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)), // Limpa os caches velhos (v1)
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  // 1. Estratégia "Network First" para navegação (HTML)
  // Garante que o usuário sempre baixe a versão mais recente do index.html (que aponta para os JS/CSS novos do Vite)
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Se deu certo buscar na rede, salva uma cópia no cache
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => {
          // Se falhou (sem internet), busca do cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. Estratégia "Stale-While-Revalidate" para o resto (JS, CSS, Imagens, CSVs)
  // Carrega instantaneamente, mas atualiza no background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Só faz cache de requisições válidas
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Ignora erros de rede se o usuário estiver offline
        });

      // Retorna o cache IMEDIATAMENTE se existir. Caso não exista, espera a internet.
      return cachedResponse || fetchPromise;
    })
  );
});
