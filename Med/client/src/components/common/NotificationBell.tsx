import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const NotificationBell: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const getStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-800',
          icon: <CheckCircle size={18} className="text-emerald-500 shrink-0" />,
          bar: 'bg-emerald-400',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: <XCircle size={18} className="text-red-500 shrink-0" />,
          bar: 'bg-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          icon: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
          bar: 'bg-amber-400',
        };
      default:
        return {
          bg: 'bg-primary-50 border-primary-200',
          text: 'text-primary-800',
          icon: <Info size={18} className="text-primary-500 shrink-0" />,
          bar: 'bg-primary-400',
        };
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[60] space-y-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map(notification => {
        const style = getStyle(notification.type);
        return (
          <div
            key={notification.id}
            className={`pointer-events-auto animate-slide-down border rounded-2xl overflow-hidden shadow-medical-lg backdrop-blur-sm ${style.bg}`}
          >
            <div className={`h-1 w-full ${style.bar}`} />
            <div className="p-4 flex items-start gap-3">
              {style.icon}
              <p className={`text-sm font-medium flex-1 ${style.text}`}>
                {notification.message}
              </p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationBell;
