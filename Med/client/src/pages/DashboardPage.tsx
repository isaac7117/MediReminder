import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import DashboardStats from '../components/dashboard/DashboardStats';
import NextMedication from '../components/dashboard/NextMedication';
import AdherenceChart from '../components/dashboard/AdherenceChart';
import ReminderCard from '../components/reminders/ReminderCard';
import { useMedications } from '../hooks/useMedications';
import { useReminders } from '../hooks/useReminders';
import { Plus, Scan } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { medications } = useMedications();
  const {
    todayReminders,
    adherence,
    isLoading: remLoading,
    takeReminder,
    skipReminder,
    fetchTodayReminders
  } = useReminders();

  useEffect(() => {
    // Solo actualizar cada minuto, no causar re-renders innecesarios
    const interval = setInterval(() => {
      fetchTodayReminders();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchTodayReminders]);

  const nextPendingReminder = todayReminders.find(r => r.status === 'pending');

  const handleTakeReminder = async (id: string) => {
    await takeReminder(id);
  };

  const handleSkipReminder = async (id: string) => {
    await skipReminder(id);
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats */}
          <DashboardStats
            medications={medications}
            adherence={adherence}
            todayReminderCount={todayReminders.length}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Next Medication */}
              <NextMedication
                reminder={nextPendingReminder || null}
                onTake={handleTakeReminder}
                isLoading={remLoading}
              />

              {/* Today's Reminders */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Medicamentos de Hoy</h3>
                {todayReminders.length === 0 ? (
                  <p className="text-gray-600">No hay recordatorios para hoy</p>
                ) : (
                  <div className="space-y-4">
                    {todayReminders.map(reminder => (
                      <ReminderCard
                        key={reminder.id}
                        reminder={reminder}
                        onTake={handleTakeReminder}
                        onSkip={handleSkipReminder}
                        isLoading={remLoading}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Adherence */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Adherencia (7 días)</h4>
                  <p className="text-4xl font-bold text-green-600">
                    {adherence ? `${adherence.adherenceRate.toFixed(0)}%` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/medications/new')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Plus size={20} />
                  Agregar Medicamento
                </button>
                <button
                  onClick={() => navigate('/scanner')}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Scan size={20} />
                  Escanear Receta
                </button>
              </div>
            </div>
          </div>

          {/* Full Width Adherence Chart */}
          <div className="mt-8">
            <AdherenceChart adherence={adherence} isLoading={remLoading} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
