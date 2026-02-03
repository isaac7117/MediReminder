import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { X } from 'lucide-react';

const NotificationBell: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const bgColorClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const textColorClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 flex justify-between items-start ${bgColorClass(notification.type)}`}
        >
          <p className={`text-sm font-medium ${textColorClass(notification.type)}`}>
            {notification.message}
          </p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationBell;
