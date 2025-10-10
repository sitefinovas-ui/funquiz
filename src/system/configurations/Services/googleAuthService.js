import api from '../Api/api_axios';

// Envoie le token Google au backend
export async function loginWithGoogleToken(googleToken) {
  const response = await api.post('/auth/google', { token: googleToken });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
}
