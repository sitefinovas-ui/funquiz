import axios from 'axios';

function computeTimeoutMs() {
  const raw =
    import.meta.env.VITE_API_TIMEOUT_MS ||
    import.meta.env.VITE_API_TIMEOUT ||
    import.meta.env.VITE_AXIOS_TIMEOUT_MS ||
    '';
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return 60000;
}

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
  const envUrl = import.meta.env.VITE_API_URL || '';
  const useProxy = String(import.meta.env.VITE_USE_PROXY || '').toLowerCase() === 'true';
  const sameOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  if (!envUrl && useProxy && sameOrigin) {
    return `${sameOrigin}/api`;
  }

  const origin = computeBackendOrigin();
  const apiBase = origin.endsWith('/api') ? origin : `${origin}/api`;
  return apiBase.replace(/\/+$/, '');
}

const normalizeRelativeMediaUrls = (value) => {
  const origin = computeBackendOrigin();
  const prefix = (s) => `${origin}${s}`;

  const normalizeMediaString = (str) => {
    if (str.startsWith('/uploads/') || str.startsWith('/public/')) return prefix(str);
    if (str.startsWith('uploads/') || str.startsWith('public/')) return `${origin}/${str}`;
    try {
      const url = new URL(str);
      if (url.pathname.startsWith('/uploads/') || url.pathname.startsWith('/public/')) {
        return `${origin}${url.pathname}`;
      }
    } catch {}
    return str;
  };

  const walk = (node) => {
    if (!node) return node;
    if (typeof node === 'string') {
      return normalizeMediaString(node);
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
  timeout: computeTimeoutMs(),
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
      const code = error?.code || '';
      const isTimeout = code === 'ECONNABORTED' || /timeout/i.test(String(error?.message || ''));
      const isCanceled =
        code === 'ERR_CANCELED' ||
        error?.name === 'CanceledError' ||
        (typeof axios.isCancel === 'function' && axios.isCancel(error));

      if (isTimeout) {
        console.error('⏱️ Timeout API:', error?.message || error);
        const timeoutError = new Error("Délai d'attente dépassé (serveur lent ou indisponible)");
        timeoutError.code = 'TIMEOUT';
        return Promise.reject(timeoutError);
      }

      if (isCanceled) {
        console.warn('⚠️ Requête annulée:', error?.message || error);
        const canceledError = new Error('Requête annulée');
        canceledError.code = 'CANCELED';
        return Promise.reject(canceledError);
      }

      console.error('❌ Aucune réponse du serveur:', error?.message || error);
      const networkError = new Error('Erreur réseau (serveur injoignable ou CORS)');
      networkError.code = code || 'NETWORK_ERROR';
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
