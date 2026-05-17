import api from '../Api/api_axios.js';

const gameConfigService = {
  getAll:    async ()           => (await api.get('/game-config')).data,
  getOne:    async (key)        => (await api.get(`/game-config/${key}`)).data,
  save:      async (key, body)  => (await api.put(`/game-config/${key}`, body)).data,
  create:    async (body)       => (await api.post('/game-config', body)).data,
  remove:    async (key)        => (await api.delete(`/game-config/${key}`)).data,
};

export default gameConfigService;
