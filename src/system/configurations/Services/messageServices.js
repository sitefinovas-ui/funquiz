import api from '../Api/api_axios.js';

const messageServices = {
  getAllMessages: async () => {
    try{ 
        const response = await api.get('/messages');
    return response.data;
    } catch (error) {
            throw error;
        }
    
  },
  getMessageById: async (message_id) => {
    try {
        const response = await api.get(`/messages/${message_id}`);
    return response.data;
    } catch (error) {
            throw error;
        }
    
  },
  createMessage: async (messageData) => {
    try {
       const response = await api.post('/messages', messageData);
    return response.data; 
    } catch (error) {
            throw error;
        }
    
  },
  updateMessage: async (message_id, messageData) => {
    try {
       const response = await api.put(`/messages/${message_id}`, messageData);
    return response.data; 
   } catch (error) {
            throw error;
        }
    
  },
  deleteMessage: async (message_id) => {
    try{
       const response = await api.delete(`/messages/${message_id}`);
        return response.data; 
    } catch (error) {
            throw error;
        }
    
  },
};

export default messageServices;
