import api from '../Api/api_axios.js';

const newsletterServices = {
  // Récupérer toutes les newsletters via l'API quiz
  getAllNewsletter: async () => {
    try {
      const response = await api.get('/newsletters');
      return response.data;
    } catch (error) {
      throw error;
    }
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
    try {
      console.log("📨 Tentative d'inscription newsletter:", data);
      const response = await api.post('/newsletters', data);
      console.log('✅ Réponse inscription:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur inscription newsletter:', {
        message: error.message,
        config: error.config,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  // Mettre à jour le statut d'une newsletter
  updateStatus: async (id, confirmed) => {
    try {
      const response = await api.put(`/newsletters/${id}/status`, { confirmed });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une newsletter
  deleteNewsletter: async (id) => {
    try {
      const response = await api.delete(`/newsletters/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Envoyer une newsletter en masse
  sendBulk: async (data) => {
    try {
      const response = await api.post('/newsletters/send', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default newsletterServices;
