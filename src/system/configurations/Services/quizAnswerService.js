import api from '../Api/api_axios.js';

const quizAnswerService = {
  async pushFinalPoints({ userId, subThematicId, answered, questions }) {
    if (!userId || !Array.isArray(answered) || answered.length === 0) return;

    for (const a of answered) {
      const body = {
        question_id: a.questionId,
        selected_option: a.selectedOption,
      };
      try {
        await api.post(`/quiz/answer/${userId}`, body);
      } catch (e) {
        console.warn('Envoi point échoué pour une réponse:', e?.message);
      }
    }
  },
};

export default quizAnswerService;