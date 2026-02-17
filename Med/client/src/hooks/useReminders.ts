import { useState, useEffect, useCallback, useRef } from 'react';
import { reminderService } from '../services/reminder.service';
import type { Reminder, AdherenceStats } from '../types/reminder.types';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [adherence, setAdherence] = useState<AdherenceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchReminders = useCallback(async (status?: string, startDate?: string, endDate?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reminderService.getAll(status, startDate, endDate);
      setReminders(response.reminders);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reminders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTodayReminders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reminderService.getToday();
      setTodayReminders(response.reminders);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch today reminders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAdherence = useCallback(async (days?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reminderService.getAdherence(days);
      setAdherence(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch adherence stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const takeReminder = async (id: string, notes?: string) => {
    try {
      const response = await reminderService.take(id, notes);
      setReminders((prev: any) =>
        prev.map((r: any) => (r.id === id ? response.reminder : r))
      );
      setTodayReminders((prev: any) =>
        prev.map((r: any) => (r.id === id ? response.reminder : r))
      );
      return response.reminder;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to take reminder');
      throw err;
    }
  };

  const skipReminder = async (id: string, reason?: string) => {
    try {
      const response = await reminderService.skip(id, reason);
      setReminders((prev: any) =>
        prev.map((r: any) => (r.id === id ? response.reminder : r))
      );
      setTodayReminders((prev: any) =>
        prev.map((r: any) => (r.id === id ? response.reminder : r))
      );
      return response.reminder;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to skip reminder');
      throw err;
    }
  };

  useEffect(() => {
    // Solo fetch una vez al montar el componente Y si el usuario está autenticado
    const token = localStorage.getItem('authToken');
    if (!hasFetched.current && token) {
      hasFetched.current = true;
      fetchTodayReminders();
      fetchAdherence(7);
    }
  }, [fetchTodayReminders, fetchAdherence]);

  // Escuchar evento cuando se toma un medicamento desde una notificación
  useEffect(() => {
    const handleMedicationTaken = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Refrescar todos los datos: recordatorios de hoy y adherencia
        fetchTodayReminders();
        fetchAdherence(7);
      }
    };

    window.addEventListener('medication-taken', handleMedicationTaken);
    return () => window.removeEventListener('medication-taken', handleMedicationTaken);
  }, [fetchTodayReminders, fetchAdherence]);

  return {
    reminders,
    todayReminders,
    adherence,
    isLoading,
    error,
    fetchReminders,
    fetchTodayReminders,
    fetchAdherence,
    takeReminder,
    skipReminder
  };
};
