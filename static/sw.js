/// <reference lib="webworker" />

const CACHE_NAME = 'flexfit-v1'
const STATIC_ASSETS = ['/', '/manifest.json']

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
    }),
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API calls - always go to network
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Skip Clerk requests
  if (url.hostname.includes('clerk')) {
    return
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Clone the response before caching
        const responseClone = response.clone()

        // Cache successful responses
        if (response.status === 200) {
          const url = new URL(request.url)

          // Only cache http/https requests
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone)
            })
          }
        }

        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse
          }

          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/')
          }

          return new Response('Offline', { status: 503 })
        })
      }),
  )
})

// Handle background sync for offline set logging
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sets') {
    event.waitUntil(syncPendingSets())
  }
})

async function syncPendingSets() {
  // Get pending sets from IndexedDB and sync
  // This would be implemented with IndexedDB for full offline support
  console.log('Syncing pending sets...')
}

// Handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/app',
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const url = event.notification.data?.url || '/app'

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    }),
  )
})
