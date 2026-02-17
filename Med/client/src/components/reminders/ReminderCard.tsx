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

  const borderColor = reminder.status === 'taken' ? 'border-l-secondary-500' 
    : reminder.status === 'missed' ? 'border-l-red-400' 
    : reminder.status === 'skipped' ? 'border-l-gray-300'
    : 'border-l-primary-500';

  return (
    <div className={`bg-white rounded-2xl shadow-medical border border-gray-100 p-5 border-l-4 ${borderColor} hover:shadow-card-hover transition-all duration-300`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            reminder.status === 'taken' ? 'bg-secondary-50' : 
            reminder.status === 'missed' ? 'bg-red-50' : 'bg-primary-50'
          }`}>
            <Clock size={16} className={
              reminder.status === 'taken' ? 'text-secondary-600' : 
              reminder.status === 'missed' ? 'text-red-500' : 'text-primary-600'
            } />
          </div>
          <div>
            <h3 className="font-semibold text-medical-dark text-sm">{reminder.medication?.name}</h3>
            <p className="text-xs text-gray-500">{reminder.medication?.dosage}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${statusColor}`}>
          {reminder.status}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 ml-12">
        <Clock size={12} />
        <span>{formatDateTime(reminder.scheduledTime, 'MMM dd HH:mm')}</span>
      </div>

      {reminder.medication?.instructions && (
        <div className="bg-primary-50/60 border border-primary-100 p-3 rounded-xl mb-3 text-xs ml-12">
          <p className="text-primary-800">{reminder.medication.instructions}</p>
        </div>
      )}

      {!isCompleted && (
        <div className="flex gap-2 ml-12">
          <button
            onClick={() => onTake(reminder.id)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-secondary-500 hover:bg-secondary-600 disabled:bg-gray-200 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm"
          >
            <CheckCircle size={15} />
            Tomar
          </button>
          <button
            onClick={() => onSkip(reminder.id)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-600 font-medium py-2 px-4 rounded-xl transition-colors text-sm"
          >
            <SkipForward size={15} />
            Omitir
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center gap-2 text-xs font-medium ml-12">
          {reminder.status === 'taken' && (
            <div className="flex items-center gap-1.5 text-secondary-600 bg-secondary-50 px-3 py-1.5 rounded-lg">
              <CheckCircle size={14} />
              <span>Tomado{reminder.takenAt ? ` a las ${formatDateTime(reminder.takenAt, 'HH:mm')}` : ''}</span>
            </div>
          )}
          {reminder.status === 'missed' && (
            <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
              <XCircle size={14} />
              <span>Perdido</span>
            </div>
          )}
          {reminder.status === 'skipped' && (
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <SkipForward size={14} />
              <span>Omitido</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReminderCard;
