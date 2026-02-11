import api from '../Api/api_axios.js';

const adminServices = {
  getCacheStats: async () => {
    const response = await api.get('/admin/cache');
    return response.data;
  },
  clearCache: async () => {
    const response = await api.post('/admin/clear-cache');
    return response.data;
  },
  getWhatsAppQr: async () => {
    const response = await api.get('/admin/whatsapp/qr');
    return response.data;
  },
};

export default adminServices;
