import axios from 'axios';

function computeBackendOrigin() {
  const envUrl = import.meta.env.VITE_API_URL || '';
  const useProxy = String(import.meta.env.VITE_USE_PROXY || '').toLowerCase() === 'true';
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

  const isIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
  const isPrivateIpv4 =
    isIpv4 &&
    (host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host));

  const useLan = host === 'localhost' || host === '127.0.0.1' || isPrivateIpv4;
  const lan = useLan ? `${protocol}//${host}:${import.meta.env.VITE_API_PORT || '5100'}` : '';

  const sameOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const raw = envUrl || lan || (useProxy ? sameOrigin : '') || 'http://localhost:5100';

  return raw.replace(/\/api\/?$/, '').replace(/\/+$/, '');
}

function computeBaseURL() {
  const useProxy = String(import.meta.env.VITE_USE_PROXY || '').toLowerCase() === 'true';
  const sameOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  if (useProxy && sameOrigin) {
    return `${sameOrigin}/api`;
  }

  const origin = computeBackendOrigin();
  const apiBase = origin.endsWith('/api') ? origin : `${origin}/api`;
  return apiBase.replace(/\/+$/, '');
}

const normalizeRelativeMediaUrls = (value) => {
  const origin = computeBackendOrigin();
  const prefix = (s) => `${origin}${s}`;

  const walk = (node) => {
    if (!node) return node;
    if (typeof node === 'string') {
      if (node.startsWith('/uploads/') || node.startsWith('/public/')) return prefix(node);
      return node;
    }
    if (Array.isArray(node)) return node.map(walk);
    if (typeof node === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(node)) out[k] = walk(v);
      return out;
    }
    return node;
  };

  return walk(value);
};

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
  (response) => {
    if (response && typeof response.data !== 'undefined') {
      response.data = normalizeRelativeMediaUrls(response.data);
    }
    return response;
  },
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
export { computeBackendOrigin };
