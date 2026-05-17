import api from '../Api/api_axios.js';

const maintenanceService = {
  getStatus: async ()            => (await api.get('/settings/maintenance')).data,
  setStatus: async (maintenance) => (await api.post('/settings/maintenance', { maintenance })).data,
};

export default maintenanceService;
