import apiClient from './api';

const getApiErrorMessage = (error: any, fallback: string): string => {
  return error?.response?.data?.message || fallback;
};

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
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await apiClient.post('/auth/login', {
        email: normalizedEmail,
        password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'No se pudo iniciar sesión'));
    }
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
  },

  googleLogin: async (credential: string) => {
    try {
      const response = await apiClient.post('/auth/google', {
        credential,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'No se pudo iniciar sesión con Google'));
    }
  },

  completeOnboarding: async (data: {
    gender: string;
    role: string;
    careProfiles?: { name: string; relationship: string }[];
  }) => {
    const response = await apiClient.post('/auth/onboarding', data);
    return response.data;
  },

  getCareProfiles: async () => {
    const response = await apiClient.get('/auth/care-profiles');
    return response.data;
  }
};
