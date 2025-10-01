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
            const response = await api.get(`/thematic/${thematic_id}`);
            return response.data;
        }       
        catch (error) {
            throw error;
        }
    }
};

export default thematicService; 