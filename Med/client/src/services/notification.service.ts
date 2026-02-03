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
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
    throw new Error('Service Worker o PushManager no soportados');
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

      // 3. Obtener VAPID key
      const vapidPublicKey = await notificationService.getVAPIDPublicKey();
      
      // 4. Crear suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // 5. Enviar al servidor
      await notificationService.subscribe(subscription);
      
      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error setting up push subscription:', error);
      throw error;
    }
  },

  // Verificar si ya está suscrito
  isSubscribed: async () => {
    if (!('serviceWorker' in navigator)) return false;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch {
      return false;
    }
  },

  // Obtener el estado actual de las notificaciones
  getStatus: () => {
    return {
      supported: 'Notification' in window && 'serviceWorker' in navigator,
      permission: 'Notification' in window ? Notification.permission : 'unsupported'
    };
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
