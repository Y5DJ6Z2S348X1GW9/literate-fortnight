// Service Worker for PWA and Push Notifications
const CACHE_NAME = 'cross-device-messaging-v1';

// Get base path from service worker scope
const BASE_PATH = self.registration.scope;

// Use relative paths for caching
const urlsToCache = [
    './',
    './index.html',
    './styles/main.css',
    './js/app.js',
    './js/config/ConfigManager.js',
    './js/storage/StorageManager.js',
    './js/brokers/BrokerFactory.js',
    './js/brokers/AblyBroker.js',
    './js/brokers/PusherBroker.js',
    './js/messaging/MessageManager.js',
    './js/messaging/ConnectionManager.js',
    './js/ui/UIController.js',
    './js/ui/ConfigWizard.js',
    './manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                // Resolve relative paths using BASE_PATH
                const resolvedUrls = urlsToCache.map(url => new URL(url, BASE_PATH).href);
                return cache.addAll(resolvedUrls);
            })
            .catch((error) => {
                console.error('[Service Worker] Cache failed:', error);
            })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of all pages immediately
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    // Cache the fetched response
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Return a custom offline page if available
                return caches.match(new URL('./index.html', BASE_PATH).href);
            })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received');
    
    // Use relative path for default icon
    const defaultIcon = new URL('./icons/icon-192.png', BASE_PATH).href;
    
    let notificationData = {
        title: '新消息',
        body: '您收到了一条新消息',
        icon: defaultIcon,
        badge: defaultIcon,
        tag: 'message-notification',
        requireInteraction: false
    };
    
    // Parse push data if available
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                title: data.title || '新消息',
                body: data.body || data.content || '您收到了一条新消息',
                icon: data.icon || defaultIcon,
                badge: defaultIcon,
                tag: 'message-notification',
                data: data,
                requireInteraction: false
            };
        } catch (error) {
            console.error('[Service Worker] Failed to parse push data:', error);
            notificationData.body = event.data.text();
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');
    
    event.notification.close();
    
    // Focus or open the app window
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If a window is already open, focus it
                for (let client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise, open a new window using relative path
                if (clients.openWindow) {
                    return clients.openWindow(new URL('./', BASE_PATH).href);
                }
            })
    );
});

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    // Handle show notification request from app
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon, data } = event.data;
        const defaultIcon = new URL('./icons/icon-192.png', BASE_PATH).href;
        self.registration.showNotification(title, {
            body,
            icon: icon || defaultIcon,
            badge: defaultIcon,
            tag: 'message-notification',
            data,
            requireInteraction: false
        });
    }
});
