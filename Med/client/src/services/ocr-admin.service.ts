import apiClient from './api';

export const ocrAdminService = {
  getSamples: async (adminKey: string, params?: { limit?: number; includeInTraining?: boolean; consent?: boolean }) => {
    const response = await apiClient.get('/ocr/admin/samples', {
      params,
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  updateSample: async (adminKey: string, id: string, data: { includeInTraining?: boolean; correctedOutput?: any }) => {
    const response = await apiClient.patch(`/ocr/admin/samples/${id}`, data, {
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  deleteSample: async (adminKey: string, id: string) => {
    const response = await apiClient.delete(`/ocr/admin/samples/${id}`, {
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  getMetrics: async (adminKey: string, limit = 1000) => {
    const response = await apiClient.get('/ocr/admin/metrics', {
      params: { limit },
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  getTrainingJobs: async (adminKey: string) => {
    const response = await apiClient.get('/ocr/admin/training-jobs', {
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  triggerTraining: async (adminKey: string) => {
    const response = await apiClient.post('/ocr/admin/train', {}, {
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  refreshTrainingJobs: async (adminKey: string) => {
    const response = await apiClient.post('/ocr/admin/training-jobs/refresh', {}, {
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  exportDataset: async (adminKey: string, limit = 1000) => {
    const response = await apiClient.get('/ocr/training-dataset', {
      params: { format: 'jsonl', limit },
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  }
};
