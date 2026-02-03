import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AdherenceStats } from '../../types/reminder.types';

interface AdherenceChartProps {
  adherence: AdherenceStats | null;
  isLoading: boolean;
}

const AdherenceChart: React.FC<AdherenceChartProps> = ({ adherence, isLoading }) => {
  if (isLoading || !adherence) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Tasa de Adherencia: {adherence.adherenceRate.toFixed(1)}%</h3>
      
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={adherence.dailyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="taken" stackId="a" fill="#10b981" name="Tomados" />
            <Bar dataKey="missed" stackId="a" fill="#ef4444" name="Perdidos" />
            <Bar dataKey="skipped" stackId="a" fill="#9ca3af" name="Omitidos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Tomados</p>
          <p className="text-2xl font-bold text-green-600">{adherence.taken}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Perdidos</p>
          <p className="text-2xl font-bold text-red-600">{adherence.missed}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Omitidos</p>
          <p className="text-2xl font-bold text-gray-600">{adherence.skipped}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-blue-600">{adherence.total}</p>
        </div>
      </div>
    </div>
  );
};

export default AdherenceChart;
