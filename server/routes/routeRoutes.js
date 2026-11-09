import express from 'express';
import {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} from '../controllers/routeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllRoutes)
  .post(protect, adminOnly, createRoute);

router.route('/:id')
  .get(getRouteById)
  .put(protect, adminOnly, updateRoute)
  .delete(protect, adminOnly, deleteRoute);

export default router;
