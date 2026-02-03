import apiClient from './api';

export const reminderService = {
  getAll: async (status?: string, startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/reminders', {
      params: { status, startDate, endDate }
    });
    return response.data;
  },

  getToday: async () => {
    const response = await apiClient.get('/reminders/today');
    return response.data;
  },

  getUpcoming: async (hours?: number) => {
    const response = await apiClient.get('/reminders/upcoming', {
      params: { hours }
    });
    return response.data;
  },

  take: async (id: string, notes?: string) => {
    const response = await apiClient.put(`/reminders/${id}/take`, { notes });
    return response.data;
  },

  skip: async (id: string, reason?: string) => {
    const response = await apiClient.put(`/reminders/${id}/skip`, { reason });
    return response.data;
  },

  getAdherence: async (days?: number) => {
    const response = await apiClient.get('/reminders/adherence/stats', {
      params: { days }
    });
    return response.data;
  },

  regenerate: async () => {
    const response = await apiClient.post('/reminders/regenerate');
    return response.data;
  }
};
