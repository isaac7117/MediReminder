import React from 'react';
import { Edit2, Trash2, Calendar, Pill, Clock } from 'lucide-react';
import { formatDate } from '../../utils/dateHelpers';
import type { Medication } from '../../types/medication.types';

interface MedicationCardProps {
  medication: Medication;
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onEdit,
  onDelete,
  isLoading
}) => {
  const frequencyLabel = medication.frequencyType === 'daily'
    ? `${medication.frequencyTimes.length} veces al día`
    : medication.frequencyType === 'weekly'
    ? `${medication.frequencyDays.length} días por semana`
    : `Cada ${medication.frequencyValue} horas`;

  return (
    <div className={`bg-white rounded-2xl shadow-medical border border-gray-100 overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ${
      !medication.active ? 'opacity-70' : ''
    }`}>
      {medication.imageUrl && (
        <img
          src={medication.imageUrl}
          alt={medication.name}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <Pill className="text-primary-600" size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-medical-dark">{medication.name}</h3>
              <p className="text-xs text-gray-500">{medication.dosage}</p>
            </div>
          </div>
          {!medication.active && (
            <span className="badge-neutral">Inactivo</span>
          )}
        </div>

        {/* Info */}
        <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} className="text-primary-400" />
            <span className="font-medium">{frequencyLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={13} className="text-gray-400" />
            <span>{formatDate(medication.startDate)} - {medication.isContinuous ? 'Continuo' : formatDate(medication.endDate)}</span>
          </div>
        </div>

        {medication.instructions && (
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">{medication.instructions}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(medication)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary-50 hover:bg-primary-100 disabled:bg-gray-100 text-primary-700 disabled:text-gray-400 font-medium py-2.5 px-3 rounded-xl transition-all duration-200 text-sm"
          >
            <Edit2 size={15} />
            Editar
          </button>
          <button
            onClick={() => onDelete(medication.id)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 text-red-600 disabled:text-gray-400 font-medium py-2.5 px-3 rounded-xl transition-all duration-200 text-sm"
          >
            <Trash2 size={15} />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationCard;
