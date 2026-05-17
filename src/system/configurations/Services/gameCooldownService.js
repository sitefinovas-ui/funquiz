import api from '../Api/api_axios.js';

const gameCooldownService = {
  check:    async () => (await api.get('/game-cooldown')).data,
  activate: async () => (await api.post('/game-cooldown')).data,
};

export default gameCooldownService;
