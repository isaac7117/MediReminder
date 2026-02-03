import axios from 'axios';

// En desarrollo usa rutas relativas que van por el proxy de Vite
// En producción usa la URL completa del backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests AND debug logging
apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API][Auth]', 'Token found, adding Authorization header');
  } else {
    console.warn('[API][Auth]', 'No token found in localStorage!');
  }
  console.log('[API][Request]', config.method?.toUpperCase(), config.url, 'Headers:', config.headers);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('[API][Response]', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API][Error]', error.config?.url, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
