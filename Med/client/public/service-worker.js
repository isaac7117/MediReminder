const CACHE_NAME = 'medi-reminder-v5';
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
  
  // Construir cuerpo con detalles del medicamento
  let body = data.body || 'Es hora de tomar tu medicamento';
  
  // Si tenemos datos del medicamento, construir un cuerpo enriquecido
  if (notifData.medicationName && !data.body) {
    const parts = [`💊 ${notifData.dosage || ''}`];
    if (notifData.instructions) {
      parts.push(`📋 ${notifData.instructions}`);
    }
    if (notifData.scheduledTime) {
      const time = new Date(notifData.scheduledTime);
      parts.push(`🕐 Programado: ${time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
    }
    body = parts.join('\n');
  }

  // SIEMPRE incluir botones de acción (incluso sin reminderId, son útiles como UX)
  const actions = [
    { action: 'take', title: '✅ Tomar' },
    { action: 'skip', title: '❌ Omitir' }
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

  console.log('[SW] Mostrando notificación con', actions.length, 'acciones');

  const title = data.title || '💊 MediReminder';

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notifData = event.notification.data || {};

  // Helper: get auth token from an open app window
  async function getAuthToken(clients) {
    if (clients.length === 0) return null;
    try {
      const msgChannel = new MessageChannel();
      const tokenPromise = new Promise((resolve) => {
        msgChannel.port1.onmessage = (e) => resolve(e.data?.token || null);
        setTimeout(() => resolve(null), 3000);
      });
      clients[0].postMessage({ type: 'GET_AUTH_TOKEN' }, [msgChannel.port2]);
      return await tokenPromise;
    } catch { return null; }
  }

  // Helper: call API to update reminder status
  async function updateReminder(status, authToken) {
    if (!notifData.reminderId || !authToken) return false;
    const apiBase = notifData.apiBaseUrl || self.location.origin;
    const endpoint = status === 'taken' ? 'take' : 'skip';
    try {
      const response = await fetch(`${apiBase}/api/reminders/${notifData.reminderId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ notes: `${status === 'taken' ? 'Tomado' : 'Omitido'} desde notificación` })
      });
      return response.ok;
    } catch (err) {
      console.error(`[SW] Error en ${endpoint}:`, err);
      return false;
    }
  }

  if (action === 'take' || action === '') {
    // "Tomar" button or general click → mark as taken
    event.waitUntil(
      (async () => {
        try {
          const allClients = await self.clients.matchAll({ type: 'window' });
          const authToken = await getAuthToken(allClients);

          if (authToken && notifData.reminderId) {
            const ok = await updateReminder('taken', authToken);

            if (ok) {
              await self.registration.showNotification('✅ ¡Medicamento registrado!', {
                body: `${notifData.medicationName || 'Medicamento'} marcado como tomado.`,
                icon: '/icons/icon-192x192.png',
                tag: 'medication-action-confirmation',
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
            } else {
              // API call failed or no reminderId → open app
              if (allClients.length > 0) allClients[0].focus();
              else await self.clients.openWindow('/reminders');
            }
          } else {
            // No token → open app
            if (allClients.length > 0) {
              allClients[0].focus();
              if (notifData.reminderId) {
                allClients[0].postMessage({
                  type: 'TAKE_MEDICATION',
                  reminderId: notifData.reminderId,
                  medicationId: notifData.medicationId
                });
              }
            } else {
              await self.clients.openWindow('/reminders');
            }
          }
        } catch (err) {
          console.error('[SW] Error en acción take:', err);
          await self.clients.openWindow('/reminders');
        }
      })()
    );
  } else if (action === 'skip') {
    // "Omitir" button → mark as skipped
    event.waitUntil(
      (async () => {
        try {
          const allClients = await self.clients.matchAll({ type: 'window' });
          const authToken = await getAuthToken(allClients);

          if (authToken && notifData.reminderId) {
            const ok = await updateReminder('skipped', authToken);

            if (ok) {
              await self.registration.showNotification('⏭️ Medicamento omitido', {
                body: `${notifData.medicationName || 'Medicamento'} marcado como omitido.`,
                icon: '/icons/icon-192x192.png',
                tag: 'medication-action-confirmation',
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
            }
          } else {
            if (allClients.length > 0) allClients[0].focus();
            else await self.clients.openWindow('/reminders');
          }
        } catch (err) {
          console.error('[SW] Error en acción skip:', err);
        }
      })()
    );
  } else {
    // Click sin acción específica — abrir la app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow('/dashboard');
      })
    );
  }
});
