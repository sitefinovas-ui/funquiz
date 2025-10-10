import api from '../Api/api_axios.js';

const subThematicServices = {
  getAll: async (thematic_id) => {
    const url = thematic_id
      ? `/param/subthematics?thematic_id=${thematic_id}`
      : '/param/subthematics';
    const res = await api.get(url);
    return res.data;
  },
  getById: async (sub_thematic_id) => {
    const res = await api.get(`/param/subthematics/${sub_thematic_id}`);
    return res.data;
  },
  create: async (payload) => {
    const res = await api.post('/param/subthematics', payload);
    return res.data;
  },
  update: async (sub_thematic_id, payload) => {
    const res = await api.put(`/param/subthematics/${sub_thematic_id}`, payload);
    return res.data;
  },
  delete: async (sub_thematic_id) => {
    const res = await api.delete(`/param/subthematics/${sub_thematic_id}`);
    return res.data;
  },
};

export default subThematicServices;
