import api from '../Api/api_axios.js';

const authService = {
  
  getAllUsers: async () => {
    try {
      const response = await api.get('/auth/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

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
      if (response.data.success) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = `${import.meta.env.REACT_APP_BASE_URL}/profil`;
      }
    } catch (error) {
      console.error('erreur lors de la déconnexion:', error.response?.data || error.message);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = `${import.meta.env.REACT_APP_BASE_URL}/profil`;
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
        comment,
      });
      return response.data;
    } catch (error) {
      console.error('❌ deleteUserSoft:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  updateUserAdmin: async (id, fields) => {
    try {
      const payload = { user_id: id, ...fields };

      // Convertir is_active en 0/1
      if (payload.is_active !== undefined) {
        const n = Number(payload.is_active);
        payload.is_active = Number.isNaN(n) ? (payload.is_active ? 1 : 0) : n ? 1 : 0;
      }

      // Valider status
      if (payload.status) {
        const validStatus = ['active', 'suspended', 'deleted'];
        if (!validStatus.includes(payload.status)) {
          payload.status = 'active';
        }
      }

      console.log('Payload updateUserAdmin:', payload);
      const response = await api.put('/auth/update/admin', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  hardDeleteUser: async (user_id) => {
    try {
      const response = await api.delete('/auth/hard-delete', {
        data: { user_id }, // axios DELETE body
      });
      return response.data;
    } catch (error) {
      console.error('❌ hardDeleteUser:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message);
    }
  },
};
export default authService;
