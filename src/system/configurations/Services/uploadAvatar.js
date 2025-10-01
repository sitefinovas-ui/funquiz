import api from '../Api/api_axios.js';

const uploadAvatar = async (user_id, file) => {
  const formData = new FormData();
  formData.append('user_id', user_id);
  formData.append('file', file);
  return api.post('/auth/user/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default uploadAvatar;
