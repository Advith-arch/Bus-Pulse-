import { dataStore } from '../services/dataStore.js';
import { emitNotification } from '../sockets/busSocket.js';

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Public
export const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await dataStore.notification.find();
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new notification
// @route   POST /api/notifications
// @access  Private/Admin
export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, busId, routeId } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide notification title and message.',
      });
    }

    const newNotification = await dataStore.notification.create({
      title,
      message,
      type: type || 'general',
      busId: busId || null,
      routeId: routeId || null,
    });

    // Broadcast in real-time to all connected students and admins
    emitNotification(newNotification);

    res.status(201).json({
      success: true,
      message: 'Notification posted and broadcasted successfully.',
      data: newNotification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Public or Private
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await dataStore.notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    const updated = await dataStore.notification.findByIdAndUpdate(req.params.id, {
      isRead: true,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
