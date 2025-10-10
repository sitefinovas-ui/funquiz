import api from '../Api/api_axios.js';

const quizSessionService = {
  // Liste des sessions d’un utilisateur
  getUserSessions: async (userId) => {
    const res = await api.get(`/session/user/${userId}`);
    return Array.isArray(res.data) ? res.data : [];
  },
  // Détail d’une session
  getSessionById: async (sessionId) => {
    const res = await api.get(`/session/${sessionId}`);
    return res.data;
  },
  // ➕ Créer une session
  createSession: async (payload) => {
    const res = await api.post('/session/', payload);
    return res.data; // { sessionId }
  },
  // ➕ Mettre à jour la progression
  updateSession: async (sessionId, payload) => {
    const res = await api.put(`/session/${sessionId}`, payload);
    return res.data;
  },
  // ➕ Terminer la session
  completeSession: async (sessionId) => {
    const res = await api.put(`/session/${sessionId}/complete`);
    return res.data;
  },
};

export default quizSessionService;