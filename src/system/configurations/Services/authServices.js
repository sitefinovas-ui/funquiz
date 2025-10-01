import api from '../Api/api_axios.js'; 

const authService = {
    // Récupérer les points utilisateur via l'API quiz
  getUserPoints: async (user_id) => {
    try {
      const response = await api.get(`/point/${user_id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

    requestResetPassword: async (email) => {
    try {
      const response = await api.post('/auth/password/request-reset', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await api.post('/auth/password/reset', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // même si erreur, on supprime le token côté client
    } finally {
      localStorage.removeItem('token');
    }
  },

  register: async (credentials) => {
    try {
      const response = await api.post('/auth/signup', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  putUserById: async (id, userData) => {
    try {
      // On envoie user_id + les champs à modifier
      const response = await api.put('/auth/update/profil', { user_id: id, ...userData });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUserSoft: async ({ user_id, reason, comment }) => {
  try {
    const response = await api.post('/auth/delete', {
      user_id,
      reason,
      comment
    });
    return response.data;
  } catch (error) {
    console.error("❌ deleteUserSoft:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message);
  }
}
};
export default authService;