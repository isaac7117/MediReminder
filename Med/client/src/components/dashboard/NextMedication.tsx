import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Pill } from 'lucide-react';
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
      <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-secondary-500" size={30} />
        </div>
        <h3 className="text-lg font-bold text-medical-dark mb-1">¡Todo al día!</h3>
        <p className="text-sm text-gray-500">No hay medicamentos pendientes por ahora.</p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-medical border border-amber-200 p-8 text-center pulse-ring">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-amber-600" size={30} />
        </div>
        <h3 className="text-lg font-bold text-medical-dark">¡Es hora de tomar tu medicamento!</h3>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-2xl shadow-medical border border-primary-100 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
          <Pill className="text-primary-600" size={16} />
        </div>
        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Próximo Medicamento</p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-medical-dark">{reminder.medication?.name}</h2>
        <p className="text-sm text-gray-500 mt-1">{reminder.medication?.dosage}</p>
      </div>

      {/* Countdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-inner-glow">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: timeLeft.hours, label: 'Horas' },
            { value: timeLeft.minutes, label: 'Minutos' },
            { value: timeLeft.seconds, label: 'Segundos' },
          ].map((unit, i) => (
            <div key={i}>
              <div className="bg-gradient-to-b from-primary-500 to-primary-600 text-white rounded-xl py-3 px-2 shadow-medical">
                <p className="text-2xl md:text-3xl font-bold tabular-nums">{String(unit.value).padStart(2, '0')}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">{unit.label}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onTake(reminder.id)}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-medical hover:shadow-medical-md disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isLoading ? 'Confirmando...' : 'Marcar como Tomado'}
      </button>

      {reminder.medication?.instructions && (
        <div className="mt-5 bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-start gap-2">
            <Clock className="text-primary-400 shrink-0 mt-0.5" size={14} />
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Instrucciones:</span> {reminder.medication.instructions}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextMedication;
