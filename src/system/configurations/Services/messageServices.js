// src/system/configurations/Services/messageServices.js
import api from '../Api/api_axios.js';

const messageServices = {
  // 🔹 Récupérer tous les messages
  getAllMessages: async () => {
    try {
      const response = await api.get('/messages');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages :', error);
      throw error;
    }
  },

  // 🔹 Récupérer un message par son ID
  getMessageById: async (message_id) => {
    try {
      const response = await api.get(`/messages/${message_id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du message ${message_id} :`, error);
      throw error;
    }
  },

  // 🔹 Créer un nouveau message
  createMessage: async (messageData) => {
    try {
      const response = await api.post('/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du message :', error);
      throw error;
    }
  },

  // 🔹 Mettre à jour un message existant
  updateMessage: async (message_id, messageData) => {
    try {
      const response = await api.put(`/messages/${message_id}`, messageData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du message ${message_id} :`, error);
      throw error;
    }
  },

  // 🔹 Envoyer un email à partir d’un message
  sendEmail: async (emailData) => {
    try {
      const response = await api.post('/messages/send-email', emailData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l’envoi de l’email :', error?.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 Supprimer un message
  deleteMessage: async (message_id) => {
    try {
      const response = await api.delete(`/messages/${message_id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du message ${message_id} :`, error);
      throw error;
    }
  },
};

export default messageServices;
