import api from '../Api/api_axios.js';

// Service pour gérer les points utilisateur
const pointService = {
  // Récupérer les points d'un utilisateur spécifique
  getUserPoints: async (user_id) => {
    try {
      const response = await api.get(`/point/${user_id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des points utilisateur :', error);
      throw error;
    }
  },

  // Récupérer le classement de tous les utilisateurs
  getAllUsersPoints: async () => {
    try {
      const response = await api.get('/ranking');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du classement :', error);
      throw error;
    }
  },
};

export default pointService;
