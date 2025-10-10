import api from '../Api/api_axios.js';

const contactServices = {
  getAll: async () => (await api.get('/legal/contact')).data,
  getById: async (id) => (await api.get(`/legal/contact/${id}`)).data,
  create: async (payload) => (await api.post('/legal/contact', payload)).data,
  update: async (id, payload) => (await api.put(`/legal/contact/${id}`, payload)).data,
  delete: async (id) => (await api.delete(`/legal/contact/${id}`)).data,
};

export default contactServices;
