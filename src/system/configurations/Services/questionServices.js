import api from '../Api/api_axios.js';

const questionServices = {
  create: async (payload) => {
    const isFormData = payload instanceof FormData;
    const res = await api.post('/param/questions', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return res.data;
  },
  createAnswers: async (payload) => {
    const res = await api.post('/param/questions/answers', payload);
    return res.data;
  },
  update: async (question_id, payload) => {
    const isFormData = payload instanceof FormData;
    const res = await api.put(`/param/questions/${question_id}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return res.data;
  },
  updateAnswers: async (question_id, payload) => {
    const res = await api.put(`/param/questions/${question_id}/answers`, payload);
    return res.data;
  },
  delete: async (question_id) => {
    const res = await api.delete(`/param/questions/${question_id}`);
    return res.data;
  },
  getBySubThematic: async (sub_thematic_id) => {
    const res = await api.get(`/quiz/subthematic/${sub_thematic_id}/questions`);
    return res.data;
  },
  getAnswers: async (question_id) => {
    const res = await api.get(`/quiz/question/${question_id}/answers`);
    return res.data;
  },
  importQuestions: async (formData) => {
    const res = await api.post('/param/questions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default questionServices;
