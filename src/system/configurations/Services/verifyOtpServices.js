import api from '../Api/api_axios.js';

const verifyService = {
  sendOtp: async (number) => {
    const response = await api.post('/send-otp', { number });
    return response.data;
  },
  verifyOtp: async (number, code) => {
    const response = await api.post('/verify-otp', { number, code });
    return response.data;
  },
};

export default verifyService;
