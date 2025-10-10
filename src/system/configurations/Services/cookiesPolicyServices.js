import api from '../Api/api_axios.js';

const cookiesPolicyServices = {
  getAll: async () => (await api.get('/legal/cookies')).data,
  getById: async (id) => (await api.get(`/legal/cookies/${id}`)).data,
  create: async (payload) => (await api.post('/legal/cookies', payload)).data,
  update: async (id, payload) => (await api.put(`/legal/cookies/${id}`, payload)).data,
  delete: async (id) => (await api.delete(`/legal/cookies/${id}`)).data,
};

export default cookiesPolicyServices;
