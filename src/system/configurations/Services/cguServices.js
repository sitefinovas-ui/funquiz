import api from '../Api/api_axios.js';

const cguServices = {
  getAll: async () => (await api.get('/legal/cgu')).data,
  getById: async (id) => (await api.get(`/legal/cgu/${id}`)).data,
  create: async (payload) => (await api.post('/legal/cgu', payload)).data,
  update: async (id, payload) => (await api.put(`/legal/cgu/${id}`, payload)).data,
  delete: async (id) => (await api.delete(`/legal/cgu/${id}`)).data,
};

export default cguServices;
