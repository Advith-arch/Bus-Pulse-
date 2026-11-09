import express from 'express';
import { getAllStudents, updatePreferredRoute } from '../controllers/studentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllStudents);
router.put('/:id/preferred-route', protect, updatePreferredRoute);

export default router;
