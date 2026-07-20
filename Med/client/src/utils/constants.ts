export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'hourly', label: 'Cada X horas' }
];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

export const REMINDER_STATUS = {
  PENDING: 'pending',
  TAKEN: 'taken',
  MISSED: 'missed',
  SKIPPED: 'skipped'
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  taken: 'bg-green-100 text-green-800 border-green-300',
  missed: 'bg-red-100 text-red-800 border-red-300',
  skipped: 'bg-gray-100 text-gray-800 border-gray-300'
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  taken: 'Tomado',
  missed: 'Perdido',
  skipped: 'Omitido'
};

export const API_TIMEOUT = 30000; // 30 seconds

// Relaciones para los perfiles de pacientes (modo cuidador)
export const RELATIONSHIPS = [
  { value: 'grandmother', label: 'Abuela' },
  { value: 'grandfather', label: 'Abuelo' },
  { value: 'mother', label: 'Mamá' },
  { value: 'father', label: 'Papá' },
  { value: 'aunt', label: 'Tía' },
  { value: 'uncle', label: 'Tío' },
  { value: 'spouse', label: 'Esposo/a' },
  { value: 'child', label: 'Hijo/a' },
  { value: 'sibling', label: 'Hermano/a' },
  { value: 'other', label: 'Otro' },
];

export const RELATIONSHIP_LABELS: Record<string, string> = {
  self: 'Yo',
  ...Object.fromEntries(RELATIONSHIPS.map(r => [r.value, r.label]))
};
