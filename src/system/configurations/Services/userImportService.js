import api from '../Api/api_axios.js';

export async function uploadUsers(formData) {
  try {
    const res = await api.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    const errData = error?.response?.data;
    const message = errData?.error || error.message || 'Erreur import utilisateurs';
    // Renvoyer l’erreur avec détails si présents
    const details = errData?.details;
    const e = new Error(message);
    e.details = details;
    throw e;
  }
}
