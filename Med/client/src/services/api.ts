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

// Agregar token a cada request
apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró o es inválido, limpiar la sesión
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // No limpiar sesión en rutas de auth (login/register)
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        console.warn('[API] Token expirado o inválido, cerrando sesión...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
