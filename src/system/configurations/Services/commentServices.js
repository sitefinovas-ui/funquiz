import api from '../Api/api_axios.js';

const commentServices = {
  getAllComments: async () => {
    try {
      const response = await api.get('/comments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCommentById: async (comment_id) => {
    try {
      const response = await api.get(`/comments/${comment_id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createComment: async (commentData) => {
    try {
      const response = await api.post('/comments', commentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateComment: async (comment_id, commentData) => {
    try {
      const response = await api.put(`/comments/${comment_id}`, commentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteComment: async (comment_id) => {
    try {
      const response = await api.delete(`/comments/${comment_id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCommentsWithUserAndQuiz: async () => {
    try {
      const response = await api.get('/comments-with-details');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
export default commentServices;
