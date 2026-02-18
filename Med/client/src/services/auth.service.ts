import apiClient from './api';

export const authService = {
  register: async (email: string, password: string, confirmPassword: string, fullName: string) => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      confirmPassword,
      fullName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};
