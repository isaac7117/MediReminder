import React from 'react';
import Navbar from '../components/common/Navbar';
import ReminderCard from '../components/reminders/ReminderCard';
import { useReminders } from '../hooks/useReminders';
import { useNotifications } from '../hooks/useNotifications';
import { reminderService } from '../services/reminder.service';
import { notificationService } from '../services/notification.service';
import { Calendar, RefreshCw, Bell, BellRing, Send } from 'lucide-react';

const RemindersPage: React.FC = () => {
  const { reminders, isLoading, fetchReminders, takeReminder, skipReminder } = useReminders();
  const { showNotification } = useNotifications();
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'taken' | 'missed'>('all');
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [notifStatus, setNotifStatus] = React.useState<{
    supported: boolean;
    permission: string;
    subscribed: boolean;
  }>({ supported: false, permission: 'default', subscribed: false });
  const [isSettingUpNotifs, setIsSettingUpNotifs] = React.useState(false);
  const [isSendingTest, setIsSendingTest] = React.useState(false);

  React.useEffect(() => {
    fetchReminders(filter === 'all' ? undefined : filter);
    checkNotificationStatus();
  }, [filter]);

  const checkNotificationStatus = async () => {
    const status = notificationService.getStatus();
    const subscribed = await notificationService.isSubscribed();
    setNotifStatus({ ...status, subscribed });
  };

  const handleSetupNotifications = async () => {
    try {
      setIsSettingUpNotifs(true);
      await notificationService.setupPushSubscription();
      showNotification('success', '¡Notificaciones push activadas correctamente!');
      await checkNotificationStatus();
    } catch (error: any) {
      showNotification('error', error.message || 'Error al configurar notificaciones');
    } finally {
      setIsSettingUpNotifs(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setIsSendingTest(true);
      const result = await notificationService.sendTestNotification();
      showNotification('success', result.message);
    } catch (error: any) {
      showNotification('error', error.message || 'Error al enviar notificación de prueba');
    } finally {
      setIsSendingTest(false);
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

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={32} />
              Recordatorios de Medicamentos
            </h1>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <RefreshCw size={18} className={isRegenerating ? 'animate-spin' : ''} />
              {isRegenerating ? 'Optimizando...' : 'Optimizar Recordatorios'}
            </button>
          </div>

          {/* Notification Panel */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {notifStatus.subscribed ? (
                  <BellRing className="text-green-500" size={24} />
                ) : (
                  <Bell className="text-gray-400" size={24} />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">Notificaciones Push</h3>
                  <p className="text-sm text-gray-600">
                    {!notifStatus.supported 
                      ? '❌ Tu navegador no soporta notificaciones'
                      : notifStatus.permission === 'denied'
                      ? '🚫 Notificaciones bloqueadas - habilita en configuración del navegador'
                      : notifStatus.subscribed
                      ? '✅ Notificaciones activas'
                      : '⚠️ Notificaciones no configuradas'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {notifStatus.supported && notifStatus.permission !== 'denied' && !notifStatus.subscribed && (
                  <button
                    onClick={handleSetupNotifications}
                    disabled={isSettingUpNotifs}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
                  >
                    <Bell size={18} />
                    {isSettingUpNotifs ? 'Configurando...' : 'Activar Notificaciones'}
                  </button>
                )}
                
                {notifStatus.subscribed && (
                  <button
                    onClick={handleTestNotification}
                    disabled={isSendingTest}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    <Send size={18} className={isSendingTest ? 'animate-pulse' : ''} />
                    {isSendingTest ? 'Enviando...' : 'Enviar Prueba'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>💡 Tip:</strong> Los recordatorios se generan automáticamente para los próximos 7 días. 
              Usa "Optimizar Recordatorios" si tienes muchos recordatorios antiguos.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-2">
            {(['all', 'pending', 'taken', 'missed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterLabels[status]}
              </button>
            ))}
          </div>

          {/* Reminders List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <Calendar size={48} className="text-primary-600" />
              </div>
              <p className="mt-4 text-gray-600">Cargando recordatorios...</p>
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">No se encontraron {filter === 'all' ? '' : filter} recordatorios</p>
            </div>
          ) : (
            <div className="space-y-4">
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
