import api from './api.js';

export const studentService = {
  async getAllStudents() {
    const res = await api.get('/students');
    return res.data.data;
  },

  async updatePreferredRoute(studentId, routeId) {
    const res = await api.put(`/students/${studentId}/preferred-route`, { preferredRoute: routeId });
    return res.data.data;
  },
};
