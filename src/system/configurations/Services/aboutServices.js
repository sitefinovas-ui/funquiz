import api from '../Api/api_axios.js';

const aboutServices = {
  getAll: async () => (await api.get('/legal/about')).data,
  getById: async (id) => (await api.get(`/legal/about/${id}`)).data,
  create: async (payload) => (await api.post('/legal/about', payload)).data,
  update: async (id, payload) => (await api.put(`/legal/about/${id}`, payload)).data,
  delete: async (id) => (await api.delete(`/legal/about/${id}`)).data,
};

export default aboutServices;
