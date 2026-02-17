import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import DashboardStats from '../components/dashboard/DashboardStats';
import NextMedication from '../components/dashboard/NextMedication';
import AdherenceChart from '../components/dashboard/AdherenceChart';
import ReminderCard from '../components/reminders/ReminderCard';
import { useMedications } from '../hooks/useMedications';
import { useReminders } from '../hooks/useReminders';
import { Plus, Scan, TrendingUp } from 'lucide-react';

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
      <div className="bg-medical-mesh min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-medical-dark tracking-tight">Panel de Control</h1>
            <p className="text-sm text-gray-500 mt-1">Resumen de tu tratamiento actual</p>
          </div>

          {/* Stats */}
          <DashboardStats
            medications={medications}
            adherence={adherence}
            todayReminderCount={todayReminders.length}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Next Medication */}
              <NextMedication
                reminder={nextPendingReminder || null}
                onTake={handleTakeReminder}
                isLoading={remLoading}
              />

              {/* Today's Reminders */}
              <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-6">
                <h3 className="section-title mb-5">Medicamentos de Hoy</h3>
                {todayReminders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="text-primary-400" size={24} />
                    </div>
                    <p className="text-gray-500 text-sm">No hay recordatorios para hoy</p>
                  </div>
                ) : (
                  <div className="space-y-3">
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
              {/* Adherence Ring */}
              <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-6">
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Adherencia (7 días)</p>
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f0fdfa" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke="url(#adherenceGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(adherence?.adherenceRate || 0) * 3.14} 314`}
                      />
                      <defs>
                        <linearGradient id="adherenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0d9488" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-2xl font-bold text-medical-dark">
                      {adherence ? `${adherence.adherenceRate.toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/medications/new')}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-medical hover:shadow-medical-md active:scale-[0.98]"
                >
                  <Plus size={18} />
                  Agregar Medicamento
                </button>
                <button
                  onClick={() => navigate('/scanner')}
                  className="w-full bg-white border border-gray-200 hover:border-accent-300 hover:bg-accent-50 text-gray-700 hover:text-accent-700 font-semibold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm hover:shadow-medical"
                >
                  <Scan size={18} />
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
