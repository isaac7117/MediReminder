import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { getTimeUntilReminder } from '../../utils/dateHelpers';
import type { Reminder } from '../../types/reminder.types';

interface NextMedicationProps {
  reminder: Reminder | null;
  onTake: (id: string) => void;
  isLoading: boolean;
}

const NextMedication: React.FC<NextMedicationProps> = ({ reminder, onTake, isLoading }) => {
  const [timeLeft, setTimeLeft] = useState<any>(null);

  useEffect(() => {
    if (!reminder) return;

    const updateTime = () => {
      const remaining = getTimeUntilReminder(reminder.scheduledTime);
      setTimeLeft(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [reminder]);

  if (!reminder) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">¡Completado!</h3>
        <p className="text-gray-600">No hay medicamentos pendientes por ahora.</p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <AlertCircle className="text-yellow-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold">¡Es hora de tomar tu medicamento!</h3>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow p-8">
      <div className="text-center mb-6">
        <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Próximo Medicamento</p>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">{reminder.medication?.name}</h2>
        <p className="text-lg text-gray-700 mt-2">{reminder.medication?.dosage}</p>
      </div>

      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-600">{String(timeLeft.hours).padStart(2, '0')}</p>
            <p className="text-sm text-gray-600">Horas</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">{String(timeLeft.minutes).padStart(2, '0')}</p>
            <p className="text-sm text-gray-600">Minutos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">{String(timeLeft.seconds).padStart(2, '0')}</p>
            <p className="text-sm text-gray-600">Segundos</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => onTake(reminder.id)}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition disabled:cursor-not-allowed"
        >
          {isLoading ? 'Confirmando...' : 'Yo lo Tomé'}
        </button>
      </div>

      {reminder.medication?.instructions && (
        <div className="mt-6 bg-white rounded p-4">
          <p className="text-sm text-gray-600">
            <strong>Instrucciones:</strong> {reminder.medication.instructions}
          </p>
        </div>
      )}
    </div>
  );
};

export default NextMedication;
