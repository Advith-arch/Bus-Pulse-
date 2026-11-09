import express from 'express';
import { startSim, stopSim, getStatus } from '../controllers/simulationController.js';

const router = express.Router();

router.post('/start', startSim);
router.post('/stop', stopSim);
router.get('/status', getStatus);

export default router;
