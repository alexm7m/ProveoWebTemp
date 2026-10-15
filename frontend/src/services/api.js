import axios from 'axios';

// VITE_API_URL es opcional: sin ella se usa el proxy de Vite (/api -> localhost:3000).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Adjunta el token guardado a cada peticion saliente.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401, la sesion ya no es valida: se limpia.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
