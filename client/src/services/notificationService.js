import api from './api.js';

export const notificationService = {
  async getAllNotifications() {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  async createNotification(notifData) {
    const res = await api.post('/notifications', notifData);
    return res.data.data;
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },
};
