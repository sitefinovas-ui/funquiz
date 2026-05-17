import api from '../Api/api_axios.js';

const storageService = {
  listImages:  async ()           => (await api.get('/storage')).data,
  uploadImage: async (formData)   => (await api.post('/storage/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).data,
  deleteImage: async (filename)   => (await api.delete(`/storage/${encodeURIComponent(filename)}`)).data,
};

export default storageService;
