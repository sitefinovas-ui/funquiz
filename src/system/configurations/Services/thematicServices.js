import api from '../Api/api_axios.js';

const thematicService = {
  // Récupérer tous les thématiques via l'API quiz
  getAllThematics: async () => {
    try {
      const response = await api.get('/quiz/allquiz');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une thématique par son ID via l'API quiz
  getThematicById: async (thematic_id) => {
    try {
      const response = await api.get(`/param/thematics/${thematic_id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une thématique (multipart)
  createThematic: async (formData) => {
    try {
      const response = await api.post('/param/thematics', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une thématique
  updateThematic: async (id, formData) => {
    try {
      const response = await api.put(`/param/thematics/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteThematic: async (id) => {
    try {
      const response = await api.delete(`/param/thematics/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  purgeThematics: async () => {
    try {
      const response = await api.delete('/param/thematics/purge');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // ➕ Nouveau: liste “raw” des thématiques (title, thematic_id, etc.)
  getAllParamThematics: async () => {
    try {
      const response = await api.get('/param/thematics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Importer des thématiques en masse
  importThematics: async (formData) => {
    try {
      const response = await api.post('/param/thematics/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default thematicService;
