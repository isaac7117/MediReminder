import apiClient from './api';

const SW_AUTH_CACHE = 'sw-auth-store';

export const notificationService = {
  getVAPIDPublicKey: async () => {
    const response = await apiClient.get('/notifications/vapid-public-key');
    return response.data.vapidPublicKey;
  },

  subscribe: async (subscription: PushSubscription) => {
    const response = await apiClient.post('/notifications/subscribe', { subscription });
    return response.data;
  },

  unsubscribe: async (subscription: PushSubscription) => {
    const response = await apiClient.post('/notifications/unsubscribe', { subscription });
    return response.data;
  },

  sendTestNotification: async () => {
    const response = await apiClient.post('/notifications/test');
    return response.data;
  },

  registerServiceWorker: async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker no soportado en este navegador');
    }
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('[Notif] Service Worker registrado:', registration.scope);
    return registration;
  },

  requestNotificationPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  /**
   * One-click setup: requests permission → registers SW → subscribes to push.
   * Falls back to basic notifications if Push API is unavailable (e.g. Brave shields).
   * Returns 'push' | 'basic' | null.
   */
  activateNotifications: async (): Promise<'push' | 'basic'> => {
    // 1. Check basic support
    if (!('Notification' in window)) {
      throw new Error('Tu navegador no soporta notificaciones. Usa Chrome, Edge o Firefox actualizado.');
    }

    // 2. Check if already denied
    if (Notification.permission === 'denied') {
      throw new Error(
        'Las notificaciones están bloqueadas.\n\n' +
        '→ Haz clic en el icono de candado 🔒 en la barra de direcciones\n' +
        '→ Busca "Notificaciones" y cámbialas a "Permitir"\n' +
        '→ Recarga la página'
      );
    }

    // 3. Request permission (must be in user-gesture context)
    const granted = await notificationService.requestNotificationPermission();
    if (!granted) {
      throw new Error(
        'Permiso de notificaciones denegado.\n\n' +
        'Si no viste la ventana de permiso, verifica que tu navegador no esté bloqueando las notificaciones automáticamente.\n\n' +
        'En Brave: Configuración → Privacidad → Notificaciones → Permitir este sitio'
      );
    }

    // 4. Try full push setup (may fail in Brave or browsers without PushManager)
    const hasPush = 'serviceWorker' in navigator && 'PushManager' in window;
    if (hasPush) {
      try {
        const registration = await notificationService.registerServiceWorker();

        // Wait for SW to be ready
        await navigator.serviceWorker.ready;

        const vapidPublicKey = await notificationService.getVAPIDPublicKey();
        if (!vapidPublicKey || vapidPublicKey.length < 20) {
          console.warn('[Notif] VAPID key vacía o inválida, usando notificaciones básicas');
          return 'basic';
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        await notificationService.subscribe(subscription);
        console.log('[Notif] ✅ Push subscription creada');
        return 'push';
      } catch (pushError: any) {
        console.warn('[Notif] Push falló, usando notificaciones básicas:', pushError.message);
        // Fall through to basic — permission was already granted
        return 'basic';
      }
    }

    // 5. No push support, but permission was granted → basic notifications work
    return 'basic';
  },

  // Legacy functions kept for compatibility
  setupPushSubscription: async () => {
    return notificationService.activateNotifications();
  },

  setupBasicNotifications: async (): Promise<boolean> => {
    const result = await notificationService.activateNotifications();
    return result === 'push' || result === 'basic';
  },

  isSubscribed: async () => {
    if (!('serviceWorker' in navigator)) return false;
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) return false;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch {
      return false;
    }
  },

  getStatus: () => {
    const hasNotificationAPI = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;

    return {
      notificationsSupported: hasNotificationAPI,
      pushSupported: hasNotificationAPI && hasServiceWorker && hasPushManager,
      supported: hasNotificationAPI,
      permission: hasNotificationAPI ? Notification.permission : 'unsupported',
      details: {
        notificationAPI: hasNotificationAPI,
        serviceWorker: hasServiceWorker,
        pushManager: hasPushManager
      }
    };
  },

  sendLocalNotification: (title: string, body: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'medi-reminder-local',
        requireInteraction: true,
        ...options
      });
    }
    return null;
  },

  sendLocalTestNotification: () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });

      const notif = new Notification('Es hora de tomar: Ibuprofeno (prueba)', {
        body: `500mg\nHora programada: ${timeStr}\nTomar con comida`,
        icon: '/icons/icon-192x192.png',
        tag: 'test-local',
        requireInteraction: true
      });
      setTimeout(() => notif.close(), 8000);
      return true;
    }
    return false;
  },

  /**
   * Store auth token and API base URL in Cache API so the service worker
   * can read them without needing postMessage (blocked by COOP headers).
   */
  syncAuthForServiceWorker: async () => {
    if (!('caches' in window)) return;
    try {
      const cache = await caches.open(SW_AUTH_CACHE);
      const token = localStorage.getItem('authToken') || '';
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      await cache.put('/sw-auth-token', new Response(token));
      await cache.put('/sw-api-url', new Response(apiUrl));
    } catch (e) {
      console.warn('[Notif] Error syncing auth to SW cache:', e);
    }
  },

  clearAuthForServiceWorker: async () => {
    if (!('caches' in window)) return;
    try {
      await caches.delete(SW_AUTH_CACHE);
    } catch (e) {
      console.warn('[Notif] Error clearing SW auth cache:', e);
    }
  }
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

