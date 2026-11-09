import api from './api.js';

export const simulationService = {
  async getStatus() {
    const res = await api.get('/simulation/status');
    return res.data.status;
  },

  async start() {
    const res = await api.post('/simulation/start');
    return res.data;
  },

  async stop() {
    const res = await api.post('/simulation/stop');
    return res.data;
  },
};
