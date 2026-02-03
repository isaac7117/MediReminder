import { format, addDays, startOfDay, endOfDay, isSameDay } from 'date-fns';

export const formatTime = (date: Date | string, formatStr: string = 'HH:mm'): string => {
  return format(new Date(date), formatStr);
};

export const formatDate = (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(new Date(date), formatStr);
};

export const formatDateTime = (date: Date | string, formatStr: string = 'MMM dd, yyyy HH:mm'): string => {
  return format(new Date(date), formatStr);
};

export const getTimeUntilReminder = (scheduledTime: string): { hours: number; minutes: number; seconds: number } | null => {
  const now = new Date();
  const reminder = new Date(scheduledTime);

  if (reminder <= now) {
    return null;
  }

  const diff = reminder.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

export const isToday = (date: Date | string): boolean => {
  return isSameDay(new Date(date), new Date());
};

export const getTodayStart = (): Date => {
  return startOfDay(new Date());
};

export const getTodayEnd = (): Date => {
  return endOfDay(new Date());
};

export const getWeekDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(today, i));
  }
  return dates;
};

export const timeStringToDate = (timeStr: string, baseDate?: Date): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = baseDate ? new Date(baseDate) : new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const dateToTimeString = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
