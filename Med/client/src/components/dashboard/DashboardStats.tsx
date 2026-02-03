import React from 'react';
import { Pill, Clock, TrendingUp } from 'lucide-react';
import type { Medication } from '../../types/medication.types';
import type { AdherenceStats } from '../../types/reminder.types';

interface DashboardStatsProps {
  medications: Medication[];
  adherence: AdherenceStats | null;
  todayReminderCount: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  medications,
  adherence,
  todayReminderCount
}) => {
  const activeMeds = medications.filter(m => m.active).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Medicamentos Activos</p>
            <p className="text-3xl font-bold text-gray-900">{activeMeds}</p>
          </div>
          <Pill className="text-blue-500" size={40} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Recordatorios de Hoy</p>
            <p className="text-3xl font-bold text-gray-900">{todayReminderCount}</p>
          </div>
          <Clock className="text-orange-500" size={40} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Tasa de Adherencia</p>
            <p className="text-3xl font-bold text-gray-900">
              {adherence ? `${adherence.adherenceRate.toFixed(0)}%` : 'N/A'}
            </p>
          </div>
          <TrendingUp className="text-green-500" size={40} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Tomados Hoy</p>
            <p className="text-3xl font-bold text-gray-900">
              {adherence?.taken || 0}
            </p>
          </div>
          <div className="text-green-500 text-lg">✓</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
