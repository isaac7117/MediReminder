import React from 'react';
import { Edit2, Trash2, Calendar } from 'lucide-react';
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
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
      {medication.imageUrl && (
        <img
          src={medication.imageUrl}
          alt={medication.name}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{medication.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{medication.dosage}</p>

        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <p className="text-gray-700 font-medium">{frequencyLabel}</p>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <Calendar size={14} />
            <span>{formatDate(medication.startDate)} - {medication.isContinuous ? 'Continuo' : formatDate(medication.endDate)}</span>
          </div>
        </div>

        {medication.instructions && (
          <p className="text-sm text-gray-600 mb-4 italic">{medication.instructions}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(medication)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded transition"
          >
            <Edit2 size={18} />
            Editar
          </button>
          <button
            onClick={() => onDelete(medication.id)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded transition"
          >
            <Trash2 size={18} />
            Eliminar
          </button>
        </div>
      </div>

      {!medication.active && (
        <div className="bg-gray-100 px-6 py-2 text-center text-sm text-gray-600">
          Inactivo
        </div>
      )}
    </div>
  );
};

export default MedicationCard;
