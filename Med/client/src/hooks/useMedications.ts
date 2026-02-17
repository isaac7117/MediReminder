import { useState, useEffect, useCallback } from 'react';
import { medicationService } from '../services/medication.service';
import type { Medication } from '../types/medication.types';

interface UseMedicationsOptions {
  autoFetch?: boolean;
}

export const useMedications = (options: UseMedicationsOptions = { autoFetch: true }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async (active?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await medicationService.getAll(active);
      setMedications(response.medications);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch medications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMedication = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await medicationService.create(data);
      setMedications((prev: any) => [response.medication, ...prev]);
      return response.medication;
    } catch (err: any) {
      console.error('createMedication error', err.response?.data || err.message || err);
      setError(err.response?.data?.message || 'Failed to create medication');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMedication = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await medicationService.update(id, data);
      setMedications((prev: any) =>
        prev.map((m: any) => (m.id === id ? response.medication : m))
      );
      return response.medication;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update medication');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMedication = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await medicationService.delete(id);
      setMedications((prev: any) => prev.filter((m: any) => m.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete medication');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Solo fetch si autoFetch está habilitado Y el usuario está autenticado
    const token = localStorage.getItem('authToken');
    if (options.autoFetch && token) {
      fetchMedications(true);
    }
  }, []); // Sin dependencias para ejecutar solo una vez

  return {
    medications,
    isLoading,
    error,
    fetchMedications,
    createMedication,
    updateMedication,
    deleteMedication
  };
};
