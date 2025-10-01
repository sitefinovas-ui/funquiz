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

    addNewsletter: async (email, user_id) => {
        try {
            const response = await api.post('/newsletters', { email, user_id });
            return response.data;
        } catch (error) {
            throw error;
        }
    }  
};

export default newsletterServices;  