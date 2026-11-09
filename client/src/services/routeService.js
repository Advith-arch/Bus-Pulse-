import api from './api.js';

export const routeService = {
  async getAllRoutes() {
    const res = await api.get('/routes');
    return res.data.data;
  },

  async getRouteById(id) {
    const res = await api.get(`/routes/${id}`);
    return res.data.data;
  },

  async createRoute(routeData) {
    const res = await api.post('/routes', routeData);
    return res.data.data;
  },

  async updateRoute(id, routeData) {
    const res = await api.put(`/routes/${id}`, routeData);
    return res.data.data;
  },

  async deleteRoute(id) {
    const res = await api.delete(`/routes/${id}`);
    return res.data;
  },
};
