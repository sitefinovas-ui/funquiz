import axios from 'axios';

function computeBaseURL() {
  const envUrl = import.meta.env.VITE_API_URL || '';
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const lan = host && host !== 'localhost' ? `${protocol}//${host}:${import.meta.env.VITE_API_PORT || '5100'}` : '';
  const raw = lan || envUrl || 'http://localhost:5100';
  return raw.endsWith('/api') ? raw : `${raw.replace(/\/+$/, '')}/api`;
}

const api = axios.create({
  baseURL: computeBaseURL(),
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('❌ Aucune réponse du serveur');
      const networkError = new Error('Erreur réseau');
      networkError.code = 'NETWORK_ERROR';
      return Promise.reject(networkError);
    }
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      error.message ||
      'Erreur serveur';
    error.message = message;
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;
