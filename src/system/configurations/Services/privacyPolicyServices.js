import api from '../Api/api_axios.js';

const privacyPolicyServices = {
  getAll: async () => (await api.get('/legal/privacy')).data,
  getById: async (id) => (await api.get(`/legal/privacy/${id}`)).data,
  create: async (payload) => (await api.post('/legal/privacy', payload)).data,
  update: async (id, payload) => (await api.put(`/legal/privacy/${id}`, payload)).data,
  delete: async (id) => (await api.delete(`/legal/privacy/${id}`)).data,
};

export default privacyPolicyServices;
