import React from 'react';
import Navbar from '../components/common/Navbar';
import ReminderCard from '../components/reminders/ReminderCard';
import { useReminders } from '../hooks/useReminders';
import { useNotifications } from '../hooks/useNotifications';
import { reminderService } from '../services/reminder.service';
import { notificationService } from '../services/notification.service';
import { Calendar, RefreshCw, Bell, BellRing, BellOff, Send, Info, CheckCircle } from 'lucide-react';

const RemindersPage: React.FC = () => {
  const { reminders, isLoading, fetchReminders, takeReminder, skipReminder } = useReminders();
  const { showNotification } = useNotifications();
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'taken' | 'missed'>('all');
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [notifStatus, setNotifStatus] = React.useState<{
    notificationsSupported: boolean;
    pushSupported: boolean;
    supported: boolean;
    permission: string;
    subscribed: boolean;
    basicEnabled: boolean;
    details: { notificationAPI: boolean; serviceWorker: boolean; pushManager: boolean };
  }>({ 
    notificationsSupported: false,
    pushSupported: false, 
    supported: false, 
    permission: 'default', 
    subscribed: false, 
    basicEnabled: false,
    details: { notificationAPI: false, serviceWorker: false, pushManager: false }
  });
  const [isSettingUpNotifs, setIsSettingUpNotifs] = React.useState(false);
  const [isSendingTest, setIsSendingTest] = React.useState(false);

  React.useEffect(() => {
    fetchReminders(filter === 'all' ? undefined : filter);
    checkNotificationStatus();
  }, [filter]);

  const checkNotificationStatus = async () => {
    const status = notificationService.getStatus();
    const subscribed = await notificationService.isSubscribed();
    const basicEnabled = status.notificationsSupported && status.permission === 'granted';
    setNotifStatus({ ...status, subscribed, basicEnabled });
  };

  // Configurar Push Notifications (completo con SW + VAPID)
  const handleSetupPushNotifications = async () => {
    try {
      setIsSettingUpNotifs(true);
      await notificationService.setupPushSubscription();
      showNotification('success', '¡Notificaciones push activadas correctamente!');
      await checkNotificationStatus();
    } catch (error: any) {
      showNotification('error', error.message || 'Error al configurar notificaciones push');
    } finally {
      setIsSettingUpNotifs(false);
    }
  };

  // Configurar solo permiso de notificaciones básicas del navegador
  const handleSetupBasicNotifications = async () => {
    try {
      setIsSettingUpNotifs(true);
      await notificationService.setupBasicNotifications();
      showNotification('success', '¡Notificaciones del navegador activadas!');
      await checkNotificationStatus();
    } catch (error: any) {
      showNotification('error', error.message || 'Error al activar notificaciones');
    } finally {
      setIsSettingUpNotifs(false);
    }
  };

  // Enviar notificación push de prueba (vía servidor)
  const handleTestPushNotification = async () => {
    try {
      setIsSendingTest(true);
      const result = await notificationService.sendTestNotification();
      showNotification('success', result.message);
    } catch (error: any) {
      showNotification('error', error.response?.data?.message || error.message || 'Error al enviar notificación de prueba');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Enviar notificación local de prueba (sin servidor)
  const handleTestLocalNotification = () => {
    const sent = notificationService.sendLocalTestNotification();
    if (sent) {
      showNotification('success', '¡Notificación de prueba enviada! Mira en tu escritorio.');
    } else {
      showNotification('error', 'No se pudo enviar la notificación. Verifica los permisos.');
    }
  };

  const handleTake = async (id: string) => {
    try {
      await takeReminder(id);
      showNotification('success', '¡Recordatorio marcado como tomado!');
    } catch (error: any) {
      showNotification('error', error.message || 'Error al actualizar recordatorio');
    }
  };

  const handleSkip = async (id: string) => {
    try {
      await skipReminder(id);
      showNotification('success', '¡Recordatorio omitido!');
    } catch (error: any) {
      showNotification('error', error.message || 'Error al omitir recordatorio');
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const result = await reminderService.regenerate();
      showNotification('success', `¡Recordatorios optimizados! Se crearon ${result.newCount} recordatorios para los próximos 7 días.`);
      fetchReminders(filter === 'all' ? undefined : filter);
    } catch (error: any) {
      showNotification('error', error.message || 'Error al regenerar recordatorios');
    } finally {
      setIsRegenerating(false);
    }
  };

  const filteredReminders = filter === 'all'
    ? reminders
    : reminders.filter(r => r.status === filter);

  const filterLabels: { [key: string]: string } = {
    'all': 'Todos',
    'pending': 'Pendientes',
    'taken': 'Tomados',
    'missed': 'Perdidos'
  };

  // Determinar el estado de las notificaciones para la UI
  const getNotifStatusInfo = () => {
    if (!notifStatus.notificationsSupported) {
      return {
        icon: <BellOff className="text-red-400" size={24} />,
        title: 'Notificaciones no disponibles',
        description: 'Tu navegador no soporta la API de Notificaciones. Usa Chrome, Firefox, Edge o Safari actualizado.',
        color: 'red'
      };
    }
    if (notifStatus.permission === 'denied') {
      return {
        icon: <BellOff className="text-orange-400" size={24} />,
        title: 'Notificaciones bloqueadas',
        description: 'Haz clic en el icono de candado 🔒 en la barra de direcciones → Permisos → Notificaciones → Permitir',
        color: 'orange'
      };
    }
    if (notifStatus.subscribed) {
      return {
        icon: <BellRing className="text-green-500" size={24} />,
        title: 'Notificaciones Push activas',
        description: 'Recibirás notificaciones automáticas cuando sea hora de tomar tu medicamento, incluso con el navegador cerrado.',
        color: 'green'
      };
    }
    if (notifStatus.basicEnabled) {
      return {
        icon: <Bell className="text-blue-500" size={24} />,
        title: 'Notificaciones básicas activas',
        description: notifStatus.pushSupported 
          ? 'Permisos concedidos. Puedes activar las notificaciones Push para recibirlas incluso con el navegador cerrado.'
          : 'Permisos concedidos. Las notificaciones funcionarán mientras tengas la app abierta.',
        color: 'blue'
      };
    }
    return {
      icon: <Bell className="text-gray-400" size={24} />,
      title: 'Notificaciones no configuradas',
      description: 'Activa las notificaciones para recibir recordatorios de tus medicamentos.',
      color: 'gray'
    };
  };

  const statusInfo = getNotifStatusInfo();

  return (
    <>
      <Navbar />
      <div className="bg-medical-mesh min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-medical-dark tracking-tight flex items-center gap-2.5">
                <div className="p-2 bg-primary-50 rounded-xl">
                  <Calendar size={22} className="text-primary-600" />
                </div>
                Recordatorios
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-12">Gestiona tus recordatorios de medicamentos</p>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
            >
              <RefreshCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
              {isRegenerating ? 'Optimizando...' : 'Optimizar'}
            </button>
          </div>

          {/* Notification Panel */}
          <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-5 mb-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gray-50">
                  {statusInfo.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-medical-dark text-sm">{statusInfo.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 max-w-md">
                    {statusInfo.description}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Botón: Activar notificaciones básicas (permiso del navegador) */}
                {notifStatus.notificationsSupported && notifStatus.permission !== 'denied' && notifStatus.permission !== 'granted' && (
                  <button
                    onClick={handleSetupBasicNotifications}
                    disabled={isSettingUpNotifs}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Bell size={14} />
                    {isSettingUpNotifs ? 'Activando...' : 'Activar Notificaciones'}
                  </button>
                )}

                {/* Botón: Activar Push (requiere SW + PushManager) */}
                {notifStatus.pushSupported && notifStatus.permission === 'granted' && !notifStatus.subscribed && (
                  <button
                    onClick={handleSetupPushNotifications}
                    disabled={isSettingUpNotifs}
                    className="flex items-center gap-1.5 px-4 py-2 bg-accent-500 text-white rounded-xl hover:bg-accent-600 disabled:opacity-50 transition-colors text-xs font-medium shadow-sm"
                  >
                    <BellRing size={14} />
                    {isSettingUpNotifs ? 'Configurando...' : 'Activar Push'}
                  </button>
                )}

                {/* Botón: Prueba Push (vía servidor, requiere suscripción) */}
                {notifStatus.subscribed && (
                  <button
                    onClick={handleTestPushNotification}
                    disabled={isSendingTest}
                    className="flex items-center gap-1.5 px-4 py-2 bg-secondary-500 text-white rounded-xl hover:bg-secondary-600 disabled:opacity-50 transition-colors text-xs font-medium shadow-sm"
                  >
                    <Send size={14} className={isSendingTest ? 'animate-pulse' : ''} />
                    {isSendingTest ? 'Enviando...' : 'Prueba Push'}
                  </button>
                )}

                {/* Botón: Prueba Local (solo permiso de notificación, sin push) */}
                {notifStatus.basicEnabled && (
                  <button
                    onClick={handleTestLocalNotification}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-colors text-xs font-medium"
                  >
                    <Bell size={14} />
                    Prueba Local
                  </button>
                )}
              </div>
            </div>

            {/* Detalles técnicos (colapsable) */}
            {notifStatus.notificationsSupported && !notifStatus.subscribed && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    {notifStatus.details.notificationAPI ? <CheckCircle size={12} className="text-secondary-500" /> : <Info size={12} className="text-red-400" />}
                    Notification API
                  </span>
                  <span className="flex items-center gap-1">
                    {notifStatus.details.serviceWorker ? <CheckCircle size={12} className="text-secondary-500" /> : <Info size={12} className="text-amber-400" />}
                    Service Worker
                  </span>
                  <span className="flex items-center gap-1">
                    {notifStatus.details.pushManager ? <CheckCircle size={12} className="text-secondary-500" /> : <Info size={12} className="text-amber-400" />}
                    Push Manager
                  </span>
                  <span className="flex items-center gap-1">
                    Permiso: <strong className="text-gray-600">{notifStatus.permission}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="bg-primary-50/60 border border-primary-100 rounded-xl p-4 mb-6">
            <p className="text-primary-800 text-xs">
              <strong>Tip:</strong> Los recordatorios se generan automáticamente para los próximos 7 días. 
              Usa "Optimizar" si tienes muchos recordatorios antiguos.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-3 mb-6 flex flex-wrap gap-2">
            {(['all', 'pending', 'taken', 'missed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === status
                    ? 'bg-primary-500 text-white shadow-medical'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filterLabels[status]}
              </button>
            ))}
          </div>

          {/* Reminders List */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block">
                <Calendar size={36} className="text-primary-500 animate-spin" />
              </div>
              <p className="mt-4 text-sm text-gray-500">Cargando recordatorios...</p>
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-16 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No se encontraron {filter === 'all' ? '' : filter} recordatorios</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReminders.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onTake={handleTake}
                  onSkip={handleSkip}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RemindersPage;
