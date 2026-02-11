import api from '../Api/api_axios.js';

const privateMessageService = {
  getConversations: async () => {
    const response = await api.get('/private-messages/conversations');
    return response.data;
  },

  getThread: async (userId) => {
    const response = await api.get(`/private-messages/with/${userId}`);
    return response.data;
  },

  sendMessage: async ({ receiver_id, content }) => {
    const response = await api.post('/private-messages', { receiver_id, content });
    return response.data;
  },

  markRead: async (other_id) => {
    const response = await api.post('/private-messages/read', { other_id });
    return response.data;
  },
};

export default privateMessageService;
