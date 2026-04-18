const CACHE_NAME = 'medi-reminder-v7';
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first for API, cache first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorar peticiones de Vite dev server (HMR, módulos, etc.)
  if (
    request.url.includes('/@vite') ||
    request.url.includes('/@fs') ||
    request.url.includes('/__vite') ||
    request.url.includes('/node_modules/') ||
    request.url.includes('.hot-update.') ||
    request.url.includes('?t=') ||
    request.url.includes('ws') && request.url.includes(':24678')
  ) {
    return;
  }

  // No cachear llamadas a la API
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ message: 'Sin conexión. Inténtalo de nuevo cuando tengas internet.' }),
          { 
            status: 503,
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      })
    );
    return;
  }

  // Para assets estáticos: cache first, luego network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        // Solo cachear respuestas válidas
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Fallback para navegación: devolver la página principal
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  let data = {};
  
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'MediReminder', body: event.data ? event.data.text() : 'Tienes una notificación' };
  }

  console.log('[SW] Push recibido:', JSON.stringify(data).substring(0, 200));

  const notifData = data.data || {};
  
  let body = data.body || 'Es hora de tomar tu medicamento';
  
  if (notifData.medicationName && !data.body) {
    const parts = [];
    if (notifData.dosage) parts.push(`Dosis: ${notifData.dosage}`);
    if (notifData.instructions) parts.push(notifData.instructions);
    if (notifData.scheduledTime) {
      const time = new Date(notifData.scheduledTime);
      parts.push(`Hora: ${time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
    }
    body = parts.join('\n');
  }

  const actions = [
    { action: 'take', title: 'Tomar' },
    { action: 'skip', title: 'Omitir' }
  ];

  const options = {
    body: body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    tag: data.tag || 'medication-reminder',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: notifData,
    actions: actions
  };

  const title = data.title || 'MediReminder';

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Helper: read auth token from Cache API (shared with client app)
async function getAuthTokenFromCache() {
  try {
    const cache = await caches.open('sw-auth-store');
    const response = await cache.match('/sw-auth-token');
    if (response) {
      const token = await response.text();
      return token || null;
    }
  } catch (e) {
    console.warn('[SW] Error reading auth token from cache:', e);
  }
  return null;
}

// Helper: read API base URL from Cache API
async function getApiUrlFromCache() {
  try {
    const cache = await caches.open('sw-auth-store');
    const response = await cache.match('/sw-api-url');
    if (response) {
      const url = await response.text();
      return url || null;
    }
  } catch (e) {
    console.warn('[SW] Error reading API URL from cache:', e);
  }
  return null;
}

// Helper: call API to update reminder status
async function updateReminder(notifData, status, authToken, apiBaseUrl) {
  if (!notifData.reminderId || !authToken || !apiBaseUrl) return false;
  const endpoint = status === 'taken' ? 'take' : 'skip';
  try {
    const response = await fetch(`${apiBaseUrl}/reminders/${notifData.reminderId}/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ notes: `${status === 'taken' ? 'Tomado' : 'Omitido'} desde notificación` })
    });
    console.log(`[SW] ${endpoint} response: ${response.status}`);
    return response.ok;
  } catch (err) {
    console.error(`[SW] Error en ${endpoint}:`, err);
    return false;
  }
}

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notifData = event.notification.data || {};

  console.log('[SW] notificationclick action:', JSON.stringify(action), 'reminderId:', notifData.reminderId);

  if (action === 'take') {
    event.waitUntil(
      (async () => {
        try {
          const authToken = await getAuthTokenFromCache();
          const apiBaseUrl = await getApiUrlFromCache();
          const allClients = await self.clients.matchAll({ type: 'window' });

          console.log('[SW] Take: token?', !!authToken, 'apiUrl?', apiBaseUrl, 'reminderId?', notifData.reminderId);

          if (authToken && apiBaseUrl && notifData.reminderId) {
            const ok = await updateReminder(notifData, 'taken', authToken, apiBaseUrl);

            if (ok) {
              await self.registration.showNotification('Medicamento registrado', {
                body: `${notifData.medicationName || 'Medicamento'} marcado como tomado.`,
                icon: '/icons/icon-192x192.png',
                tag: 'medication-confirmation-taken',
                requireInteraction: false,
                silent: true
              });

              for (const client of allClients) {
                client.postMessage({
                  type: 'MEDICATION_TAKEN',
                  reminderId: notifData.reminderId,
                  medicationId: notifData.medicationId,
                  medicationName: notifData.medicationName
                });
              }
              return;
            }
          }
          // Fallback: open the app
          if (allClients.length > 0) allClients[0].focus();
          else await self.clients.openWindow('/reminders');
        } catch (err) {
          console.error('[SW] Error en acción take:', err);
          await self.clients.openWindow('/reminders');
        }
      })()
    );
  } else if (action === 'skip') {
    event.waitUntil(
      (async () => {
        try {
          const authToken = await getAuthTokenFromCache();
          const apiBaseUrl = await getApiUrlFromCache();
          const allClients = await self.clients.matchAll({ type: 'window' });

          console.log('[SW] Skip: token?', !!authToken, 'apiUrl?', apiBaseUrl, 'reminderId?', notifData.reminderId);

          if (authToken && apiBaseUrl && notifData.reminderId) {
            const ok = await updateReminder(notifData, 'skipped', authToken, apiBaseUrl);

            if (ok) {
              await self.registration.showNotification('Medicamento omitido', {
                body: `${notifData.medicationName || 'Medicamento'} marcado como omitido.`,
                icon: '/icons/icon-192x192.png',
                tag: 'medication-confirmation-skipped',
                requireInteraction: false,
                silent: true
              });

              for (const client of allClients) {
                client.postMessage({
                  type: 'MEDICATION_SKIPPED',
                  reminderId: notifData.reminderId,
                  medicationId: notifData.medicationId
                });
              }
              return;
            }
          }
          if (allClients.length > 0) allClients[0].focus();
          else await self.clients.openWindow('/reminders');
        } catch (err) {
          console.error('[SW] Error en acción skip:', err);
        }
      })()
    );
  } else {
    // Click on notification body (no button) → just open the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow('/reminders');
      })
    );
  }
});
