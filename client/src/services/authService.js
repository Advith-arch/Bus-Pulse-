import api from './api.js';

export const authService = {
  async register(studentData) {
    const res = await api.post('/auth/register', studentData);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
