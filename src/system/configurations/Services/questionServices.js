import api from '../Api/api_axios.js';

const questionServices = {
  create: async (payload) => {
    const res = await api.post('/param/questions', payload);
    return res.data;
  },
  update: async (question_id, payload) => {
    const res = await api.put(`/param/questions/${question_id}`, payload);
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
};

export default questionServices;
