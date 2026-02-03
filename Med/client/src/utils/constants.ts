export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'hourly', label: 'Every X Hours' }
];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
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

export const API_TIMEOUT = 30000; // 30 seconds
