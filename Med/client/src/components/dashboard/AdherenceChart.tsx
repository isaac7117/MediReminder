import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AdherenceStats } from '../../types/reminder.types';

interface AdherenceChartProps {
  adherence: AdherenceStats | null;
  isLoading: boolean;
}

const AdherenceChart: React.FC<AdherenceChartProps> = ({ adherence, isLoading }) => {
  if (isLoading || !adherence) {
    return <div className="h-64 skeleton"></div>;
  }

  const statCards = [
    { label: 'Tomados', value: adherence.taken, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    { label: 'Perdidos', value: adherence.missed, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    { label: 'Omitidos', value: adherence.skipped, bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' },
    { label: 'Total', value: adherence.total, bg: 'bg-primary-50', text: 'text-primary-600', border: 'border-primary-100' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="section-title">Historial de Adherencia</h3>
        <span className="badge-info">{adherence.adherenceRate.toFixed(1)}%</span>
      </div>
      
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={adherence.dailyStats} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="taken" stackId="a" fill="#0d9488" name="Tomados" radius={[0, 0, 0, 0]} />
            <Bar dataKey="missed" stackId="a" fill="#ef4444" name="Perdidos" radius={[0, 0, 0, 0]} />
            <Bar dataKey="skipped" stackId="a" fill="#cbd5e1" name="Omitidos" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <div key={i} className={`${stat.bg} border ${stat.border} p-4 rounded-xl text-center`}>
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.text} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdherenceChart;
