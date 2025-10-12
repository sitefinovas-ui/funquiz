import api from '../Api/api_axios.js';

const normalizeNewsletterPayload = (payload) => {
  if (typeof payload === 'string') {
    return { email: payload.trim() };
  }
  if (payload && typeof payload === 'object') {
    return { email: String(payload.email || '').trim(), user_id: payload.user_id ?? null };
  }
  return { email: '' };
};

const newsletterServices = {
  // Récupérer toutes les newsletters via l'API
  getAllNewsletter: async () => {
    const response = await api.get('/newsletters');
    return response.data;
  },

  // Rechercher des newsletters avec filtres
  searchNewsletters: async (filters) => {
    try {
      console.log('🔍 Service - Filtres reçus:', filters);
      const params = new URLSearchParams();

      if (filters.search) {
        params.append('search', filters.search);
        console.log('🔍 Service - Ajout filtre search:', filters.search);
      }

      if (filters.confirmed !== undefined && filters.confirmed !== '') {
        params.append('confirmed', filters.confirmed);
        console.log('🔍 Service - Ajout filtre confirmed:', filters.confirmed);
      }

      if (filters.startDate) {
        params.append('startDate', filters.startDate);
        console.log('🔍 Service - Ajout filtre startDate:', filters.startDate);
      }

      if (filters.endDate) {
        params.append('endDate', filters.endDate);
        console.log('🔍 Service - Ajout filtre endDate:', filters.endDate);
      }

      const url = `/newsletters/search?${params.toString()}`;
      console.log('🔍 Service - URL complète:', url);

      console.log('🔍 Service - Envoi requête...');
      const response = await api.get(url);
      console.log('✅ Service - Réponse reçue:', response.data);

      if (!response.data || !response.data.results) {
        console.warn('⚠️ Service - Format de réponse incorrect:', response.data);
        return { results: [] };
      }

      return response.data;
    } catch (error) {
      console.error('❌ Service - Erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Ajouter une nouvelle newsletter
  addNewsletter: async (data) => {
    const body = normalizeNewsletterPayload(data);
    if (!body.email || typeof body.email !== 'string') {
      const err = new Error('Le champ email est requis et doit être une chaîne.');
      err.code = 'INVALID_EMAIL_PAYLOAD';
      throw err;
    }
    try {
      // Appel public: pas de cookies -> simplifie CORS
      const response = await api.post('/newsletters', body, { withCredentials: false });
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Erreur réseau';
      const e = new Error(message);
      e.status = error?.response?.status;
      throw e;
    }
  },

  // Mettre à jour le statut d'une newsletter
  updateStatus: async (id, confirmed) => {
    const response = await api.put(`/newsletters/${id}/status`, { confirmed });
    return response.data;
  },

  // Supprimer une newsletter
  deleteNewsletter: async (id) => {
    const response = await api.delete(`/newsletters/${id}`);
    return response.data;
  },

  // Envoyer une newsletter en masse
  sendBulk: async (data) => {
    const response = await api.post('/newsletters/send', data);
    return response.data;
  },
};

export default newsletterServices;
