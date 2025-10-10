import api from '../Api/api_axios.js';

const quizStatsServices = {
  // Récupérer toutes les statistiques
  getAllStats: async () => {
    try {
      console.log('📊 Service - Récupération de toutes les statistiques');
      const response = await api.get('/stats');
      console.log('✅ Service - Statistiques récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Service - Erreur récupération statistiques:', error);
      throw error;
    }
  },

  // Récupérer les statistiques globales
  getGlobalStats: async () => {
    try {
      const response = await api.get('/stats/global');
      return response.data;
    } catch (error) {
      console.error('❌ Service - Erreur stats globales:', error);
      throw error;
    }
  },

  // Récupérer les statistiques par thématique
  getThematicStats: async () => {
    try {
      const response = await api.get('/stats/thematics');
      return response.data;
    } catch (error) {
      console.error('❌ Service - Erreur stats thématiques:', error);
      throw error;
    }
  },

  // Récupérer l'activité récente
  getRecentActivity: async (limit = 10) => {
    try {
      const response = await api.get(`/stats/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('❌ Service - Erreur activité récente:', error);
      throw error;
    }
  },

  // Récupérer le classement
  getRankings: async (limit = 10) => {
    try {
      const response = await api.get(`/stats/rankings?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('❌ Service - Erreur classement:', error);
      throw error;
    }
  },

  // Récupérer les stats par difficulté
  getDifficultyStats: async () => {
    try {
      const response = await api.get('/stats/difficulty');
      return response.data;
    } catch (error) {
      console.error('❌ Service - Erreur stats difficulté:', error);
      throw error;
    }
  },
};

export default quizStatsServices;
