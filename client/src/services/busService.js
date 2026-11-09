import api from './api.js';

export const busService = {
  async getAllBuses() {
    const res = await api.get('/buses');
    return res.data.data;
  },

  async getBusById(id) {
    const res = await api.get(`/buses/${id}`);
    return res.data.data;
  },

  async createBus(busData) {
    const res = await api.post('/buses', busData);
    return res.data.data;
  },

  async updateBus(id, busData) {
    const res = await api.put(`/buses/${id}`, busData);
    return res.data.data;
  },

  async deleteBus(id) {
    const res = await api.delete(`/buses/${id}`);
    return res.data;
  },

  async updateBusLocation(id, locationData) {
    const res = await api.patch(`/buses/${id}/location`, locationData);
    return res.data.data;
  },

  async updateBusStatus(id, statusData) {
    const res = await api.patch(`/buses/${id}/status`, statusData);
    return res.data.data;
  },
};
