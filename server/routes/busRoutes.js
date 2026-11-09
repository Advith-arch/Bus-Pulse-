import express from 'express';
import {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  updateBusLocation,
  updateBusStatus,
} from '../controllers/busController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllBuses)
  .post(protect, adminOnly, createBus);

router.route('/:id')
  .get(getBusById)
  .put(protect, adminOnly, updateBus)
  .delete(protect, adminOnly, deleteBus);

router.patch('/:id/location', updateBusLocation);
router.patch('/:id/status', protect, adminOnly, updateBusStatus);

export default router;
