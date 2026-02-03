import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@medicationreminder.app',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

export const sendPushNotification = async (
  subscription: PushSubscription | string,
  payload: NotificationPayload
): Promise<void> => {
  try {
    const subscriptionObj = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;

    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      tag: payload.tag || 'medication-reminder',
      data: payload.data || {}
    };

    await webpush.sendNotification(subscriptionObj, JSON.stringify(notificationPayload));
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

export const sendNotificationToSubscriptions = async (
  subscriptions: (PushSubscription | string)[],
  payload: NotificationPayload
): Promise<void> => {
  const promises = subscriptions.map(sub => sendPushNotification(sub, payload));
  await Promise.allSettled(promises);
};
