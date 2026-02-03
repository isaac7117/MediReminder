import React from 'react';
import { CheckCircle, XCircle, SkipForward, Clock } from 'lucide-react';
import { formatDateTime } from '../../utils/dateHelpers';
import type { Reminder } from '../../types/reminder.types';
import { STATUS_COLORS } from '../../utils/constants';

interface ReminderCardProps {
  reminder: Reminder;
  onTake: (id: string) => void;
  onSkip: (id: string) => void;
  isLoading: boolean;
}

const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onTake,
  onSkip,
  isLoading
}) => {
  const statusColor = STATUS_COLORS[reminder.status as keyof typeof STATUS_COLORS];
  const isCompleted = reminder.status === 'taken' || reminder.status === 'skipped' || reminder.status === 'missed';

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{reminder.medication?.name}</h3>
          <p className="text-sm text-gray-600">{reminder.medication?.dosage}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor}`}>
          {reminder.status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
        <Clock size={16} />
        <span>{formatDateTime(reminder.scheduledTime, 'MMM dd HH:mm')}</span>
      </div>

      {reminder.medication?.instructions && (
        <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
          <p className="text-blue-900">{reminder.medication.instructions}</p>
        </div>
      )}

      {!isCompleted && (
        <div className="flex gap-2">
          <button
            onClick={() => onTake(reminder.id)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded transition"
          >
            <CheckCircle size={18} />
            Tomar Ahora
          </button>
          <button
            onClick={() => onSkip(reminder.id)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded transition"
          >
            <SkipForward size={18} />
            Omitir
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center gap-2 text-sm font-semibold">
          {reminder.status === 'taken' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={18} />
              <span>Tomado a las {formatDateTime(reminder.takenAt, 'HH:mm')}</span>
            </div>
          )}
          {reminder.status === 'missed' && (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle size={18} />
              <span>Perdido</span>
            </div>
          )}
          {reminder.status === 'skipped' && (
            <div className="flex items-center gap-2 text-gray-600">
              <SkipForward size={18} />
              <span>Omitido</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReminderCard;
