import api from '../Api/api_axios.js';

const faqServices = {
  getAllFaq: async () => {
    try {
      const response = await api.get('/faq');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getFaqById: async (faq_id) => {
    try {
      const response = await api.get(`/faq/${faq_id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createFaq: async (faqData) => {
    try {
      const response = await api.post('/faq', faqData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateFaq: async (faq_id, faqData) => {
    try {
      const response = await api.put(`/faq/${faq_id}`, faqData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteFaq: async (faq_id) => {
    try {
      const response = await api.delete(`/faq/${faq_id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default faqServices;
