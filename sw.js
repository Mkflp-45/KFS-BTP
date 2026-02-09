// Service Worker pour KFS BTP PWA
const CACHE_NAME = 'kfs-btp-v4';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/vente.html',
    '/location-courte.html',
    '/location-longue.html',
    '/contact.html',
    '/about.html',
    '/404.html',
    '/maintenance.html',
    '/admin.html',
    '/admin.js',
    '/utils.js',
    '/firebase-public.js',
    '/fragments.js',
    '/script.js',
    '/performance.js',
    '/error-handler.js',
    '/site-config.js',
    '/style.css',
    '/manifest.json',
    '/health-check.json',
    'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Roboto:wght@400;500&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css'
];

// Installation du Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache ouvert');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => console.log('Erreur cache:', err))
    );
    self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Stratégie de cache : Network First, puis Cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone la réponse pour la mettre en cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseClone);
                    });
                return response;
            })
            .catch(() => {
                // Si pas de réseau, utiliser le cache
                return caches.match(event.request);
            })
    );
});

// Notification push (pour futures implémentations)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Nouvelle notification KFS BTP',
        icon: '/assets/logo-kfs-btp.jpeg',
        badge: '/assets/logo-kfs-btp.jpeg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('KFS BTP Admin', options)
    );
});
