import React from 'react';
import { Pill, Clock, TrendingUp, CheckCircle } from 'lucide-react';
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

  const stats = [
    {
      label: 'Medicamentos Activos',
      value: activeMeds,
      icon: Pill,
      iconBg: 'bg-primary-50',
      iconColor: 'text-primary-600',
      accent: 'border-l-primary-500',
    },
    {
      label: 'Recordatorios de Hoy',
      value: todayReminderCount,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accent: 'border-l-amber-500',
    },
    {
      label: 'Tasa de Adherencia',
      value: adherence ? `${adherence.adherenceRate.toFixed(0)}%` : 'N/A',
      icon: TrendingUp,
      iconBg: 'bg-secondary-50',
      iconColor: 'text-secondary-600',
      accent: 'border-l-secondary-500',
    },
    {
      label: 'Tomados Hoy',
      value: adherence?.taken || 0,
      icon: CheckCircle,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accent: 'border-l-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`bg-white rounded-2xl shadow-medical border border-gray-100 p-5 border-l-4 ${stat.accent} hover:shadow-medical-md transition-all duration-300 animate-slide-up`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-medical-dark mt-1">{stat.value}</p>
            </div>
            <div className={`stat-icon ${stat.iconBg}`}>
              <stat.icon className={stat.iconColor} size={22} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
