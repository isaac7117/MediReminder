const CACHE_NAME = 'medi-reminder-v3';
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

  // Construir acciones: los botones de la notificación
  const actions = [];
  if (notifData.reminderId) {
    actions.push(
      { action: 'take', title: '✅ Tomar' },
      { action: 'snooze', title: '⏰ Posponer' }
    );
  }

  const options = {
    body: body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    tag: data.tag || 'medication-reminder',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: notifData,
    // Actions MUST be set directly in showNotification, not mutated after
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

  if ((action === 'take' || action === '') && notifData.reminderId) {
    // "Aceptar" o click general en la notificación → marcar como tomado
    event.waitUntil(
      (async () => {
        try {
          // Intentar obtener el token del cliente
          const allClients = await self.clients.matchAll({ type: 'window' });
          let authToken = null;

          // Pedir el token al primer cliente disponible
          if (allClients.length > 0) {
            const msgChannel = new MessageChannel();
            const tokenPromise = new Promise((resolve) => {
              msgChannel.port1.onmessage = (e) => resolve(e.data?.token || null);
              setTimeout(() => resolve(null), 3000);
            });
            allClients[0].postMessage({ type: 'GET_AUTH_TOKEN' }, [msgChannel.port2]);
            authToken = await tokenPromise;
          }

          if (authToken) {
            // Llamar al API para marcar como tomado
            const apiBase = notifData.apiBaseUrl || self.location.origin;
            const response = await fetch(`${apiBase}/api/reminders/${notifData.reminderId}/take`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ notes: 'Aceptado desde notificación' })
            });

            if (response.ok) {
              // Mostrar confirmación
              await self.registration.showNotification('✅ ¡Medicamento registrado!', {
                body: `${notifData.medicationName || 'Medicamento'} marcado como tomado.`,
                icon: '/icons/icon-192x192.png',
                tag: 'medication-taken-confirmation',
                requireInteraction: false,
                silent: true
              });

              // Notificar al cliente para que refresque los datos (dashboard, gráficas)
              for (const client of allClients) {
                client.postMessage({
                  type: 'MEDICATION_TAKEN',
                  reminderId: notifData.reminderId,
                  medicationId: notifData.medicationId,
                  medicationName: notifData.medicationName
                });
              }
            } else {
              console.error('[SW] Error marcando recordatorio como tomado:', response.status);
              // Abrir la app si falla
              if (allClients.length > 0) {
                allClients[0].focus();
              } else {
                await self.clients.openWindow('/reminders');
              }
            }
          } else {
            // Sin token → abrir la app en la página de recordatorios
            if (allClients.length > 0) {
              allClients[0].focus();
              allClients[0].postMessage({
                type: 'TAKE_MEDICATION',
                reminderId: notifData.reminderId,
                medicationId: notifData.medicationId
              });
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
  } else if (action === 'snooze') {
    // Reprogramar notificación en 10 minutos
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(async () => {
          const snoozeBody = notifData.medicationName 
            ? `⏰ Recordatorio pospuesto\n💊 ${notifData.medicationName} - ${notifData.dosage || ''}\n📋 ${notifData.instructions || 'Sin instrucciones'}`
            : '⏰ Recordatorio pospuesto - ¡Es hora de tomar tu medicamento!';

          await self.registration.showNotification(
            `💊 ${notifData.medicationName || 'MediReminder'}`, 
            {
              body: snoozeBody,
              icon: '/icons/icon-192x192.png',
              tag: 'medication-reminder-snooze',
              requireInteraction: true,
              vibrate: [200, 100, 200, 100, 200],
              actions: [
                { action: 'take', title: '✅ Aceptar' },
                { action: 'snooze', title: '⏰ Posponer' }
              ],
              data: notifData
            }
          );
          resolve();
        }, 10 * 60 * 1000);
      })
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
