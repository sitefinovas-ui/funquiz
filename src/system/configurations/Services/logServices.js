import api from '../Api/api_axios.js';

const logServices = {
  getLogs: async (limit = 500) => {
    const res = await api.get(`/logs?limit=${limit}`);
    return res.data; // { lines: [...], total: N }
  },
};

export default logServices;