import apiClient from './api';
import type { Medication, CreateMedicationInput } from '../types/medication.types';

export const medicationService = {
  create: async (data: CreateMedicationInput) => {
    const response = await apiClient.post('/medications', data);
    return response.data;
  },

  getAll: async (active?: boolean) => {
    const response = await apiClient.get('/medications', {
      params: { active }
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/medications/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Medication>) => {
    const response = await apiClient.put(`/medications/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/medications/${id}`);
    return response.data;
  }
};
