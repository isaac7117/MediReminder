import apiClient from './api';

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

  // Enviar notificación de prueba
  sendTestNotification: async () => {
    const response = await apiClient.post('/notifications/test');
    return response.data;
  },

  registerServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
    throw new Error('Service Worker no soportado en este navegador');
  },

  requestNotificationPermission: async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }
    return false;
  },

  // Enviar notificación local (sin service worker / push)
  sendLocalNotification: (title: string, body: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'medi-reminder-local',
        requireInteraction: true,
        ...options
      });
      return notif;
    }
    return null;
  },

  // Configurar suscripción push completa
  setupPushSubscription: async () => {
    try {
      // 1. Registrar service worker
      const registration = await notificationService.registerServiceWorker();
      
      // 2. Pedir permiso
      const permission = await notificationService.requestNotificationPermission();
      if (!permission) {
        throw new Error('Permiso de notificaciones denegado');
      }

      // 3. Verificar soporte de PushManager
      if (!('PushManager' in window)) {
        console.warn('PushManager no soportado — usando notificaciones locales');
        return null;
      }

      // 4. Obtener VAPID key
      const vapidPublicKey = await notificationService.getVAPIDPublicKey();
      
      // 5. Crear suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // 6. Enviar al servidor
      await notificationService.subscribe(subscription);
      
      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error setting up push subscription:', error);
      throw error;
    }
  },

  // Solo pedir permiso de notificación del navegador (sin push/SW)
  setupBasicNotifications: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      throw new Error('Este navegador no soporta notificaciones de escritorio');
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission === 'denied') {
      throw new Error('Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador (icono de candado en la barra de direcciones).');
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return true;
    }
    
    throw new Error('Permiso de notificaciones denegado');
  },

  // Verificar si ya está suscrito a push
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

  // Obtener el estado actual de las notificaciones
  getStatus: () => {
    const hasNotificationAPI = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    
    return {
      // Notificaciones básicas del navegador
      notificationsSupported: hasNotificationAPI,
      // Push requiere SW + PushManager
      pushSupported: hasNotificationAPI && hasServiceWorker && hasPushManager,
      // Para el campo legacy "supported" — ahora true si al menos notificaciones básicas funcionan
      supported: hasNotificationAPI,
      permission: hasNotificationAPI ? Notification.permission : 'unsupported',
      // Info detallada
      details: {
        notificationAPI: hasNotificationAPI,
        serviceWorker: hasServiceWorker,
        pushManager: hasPushManager
      }
    };
  },

  // Enviar notificación de prueba local (sin backend) - simula un recordatorio real
  sendLocalTestNotification: () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      const notif = new Notification('💊 Es hora de tomar: Ibuprofeno (prueba)', {
        body: `💊 500mg\n🕐 Hora programada: ${timeStr}\n📋 Tomar con comida`,
        icon: '/icons/icon-192x192.png',
        tag: 'test-local',
        requireInteraction: true
      });
      
      // Auto-cerrar después de 8 segundos
      setTimeout(() => notif.close(), 8000);
      return true;
    }
    return false;
  }
};

// Función auxiliar para convertir VAPID key
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

