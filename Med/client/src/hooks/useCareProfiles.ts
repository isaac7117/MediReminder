import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import type { CareProfile } from '../types/user.types';

/**
 * Hook para gestionar los perfiles de pacientes (modo cuidador).
 * Carga la lista de pacientes y permite agregar uno nuevo.
 */
export const useCareProfiles = (options: { autoFetch?: boolean } = { autoFetch: true }) => {
  const [careProfiles, setCareProfiles] = useState<CareProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCareProfiles = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.getCareProfiles();
      setCareProfiles(response.careProfiles || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar los pacientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCareProfile = useCallback(async (name: string, relationship: string) => {
    const response = await authService.createCareProfile({ name, relationship });
    const created: CareProfile = response.careProfile;
    setCareProfiles(prev => [...prev, created]);
    return created;
  }, []);

  useEffect(() => {
    if (options.autoFetch) {
      fetchCareProfiles();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { careProfiles, isLoading, error, fetchCareProfiles, addCareProfile };
};
