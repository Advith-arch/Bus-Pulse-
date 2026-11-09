import express from 'express';
import {
  getAllNotifications,
  createNotification,
  markAsRead,
} from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllNotifications)
  .post(protect, adminOnly, createNotification);

router.patch('/:id/read', markAsRead);

export default router;
