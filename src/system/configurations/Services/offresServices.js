import api from '../Api/api_axios.js';

const offresServices = {
  list:     async ()           => (await api.get('/publicites')).data,
  getById:  async (id)         => (await api.get(`/publicites/${id}`)).data,
  create:   async (payload)    => (await api.post('/publicites', payload)).data,
  update:   async (id, payload) => (await api.put(`/publicites/${id}`, payload)).data,
  delete:   async (id)         => (await api.delete(`/publicites/${id}`)).data,
};

export default offresServices;
