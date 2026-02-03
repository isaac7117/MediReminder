import React, { createContext, useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: Notification['type'], message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let notificationIdCounter = 0;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }: any) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (type: Notification['type'], message: string, duration: number = 5000) => {
      const id = `notif-${++notificationIdCounter}-${Date.now()}`;
      const notification: Notification = { id, type, message, duration };

      setNotifications((prev: any) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev: any) => prev.filter((n: any) => n.id !== id));
  }, []);

  const value = { notifications, showNotification, removeNotification };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
