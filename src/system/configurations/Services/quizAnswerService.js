import api from '../Api/api_axios.js';

const quizAnswerService = {
  async pushFinalPoints({ userId, answered }) {
    if (!userId || !Array.isArray(answered) || answered.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const a of answered) {
      const questionId = a?.questionId;
      const selectedOption = a?.selectedOption;
      if (!questionId || !selectedOption) {
        failed += 1;
        continue;
      }

      const body = {
        question_id: questionId,
        selected_option: selectedOption,
      };
      try {
        await api.post(`/quiz/answer/${userId}`, body);
        sent += 1;
      } catch (e) {
        failed += 1;
        console.warn('Envoi point échoué pour une réponse:', e?.message);
      }
    }

    return { sent, failed };
  },
};

export default quizAnswerService;
