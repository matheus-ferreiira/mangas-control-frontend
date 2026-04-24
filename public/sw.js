const CACHE_VERSION = 'v1';
const CACHE_NAME = `neon-curator-${CACHE_VERSION}`;

// Assets para fazer cache na instalação
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.png',
];

// Instalar o service worker
self.addEventListener('install', (event: any) => {
    console.log('Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cacheando assets estáticos');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('Alguns assets não puderam ser cacheados:', err);
                return Promise.resolve();
            });
        }),
    );
    self.skipWaiting();
});

// Ativar o service worker e limpar caches antigos
self.addEventListener('activate', (event: any) => {
    console.log('Service Worker ativando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`Removendo cache antigo: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve();
                }),
            );
        }),
    );
    self.clients.claim();
});

// Estratégia de cache: Network first, fall back to cache
self.addEventListener('fetch', (event: any) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requisições não-GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignorar requisições para domínios externos (ex: API)
    if (url.origin !== self.location.origin) {
        event.respondWith(fetch(request));
        return;
    }

    // Network first para HTML
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Fazer cache da resposta bem-sucedida
                    if (response.ok) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Se offline, tentar cache
                    return caches.match(request);
                }),
        );
        return;
    }

    // Cache first para assets (CSS, JS, imagens)
    if (
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font'
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                return (
                    cached ||
                    fetch(request).then((response) => {
                        if (response.ok) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        }
                        return response;
                    })
                );
            }),
        );
        return;
    }

    // Padrão: Network first, fall back to cache
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(request) || new Response('Offline', { status: 503 });
            }),
    );
});
