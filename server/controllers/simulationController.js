import { startSimulation, stopSimulation, getSimulationStatus } from '../services/simulationService.js';

// @desc    Start GPS Bus Simulation
// @route   POST /api/simulation/start
// @access  Public or Private/Admin
export const startSim = (req, res) => {
  const isRunning = startSimulation();
  res.status(200).json({
    success: true,
    message: 'Bus movement simulation started.',
    status: getSimulationStatus(),
  });
};

// @desc    Stop GPS Bus Simulation
// @route   POST /api/simulation/stop
// @access  Public or Private/Admin
export const stopSim = (req, res) => {
  const isRunning = stopSimulation();
  res.status(200).json({
    success: true,
    message: 'Bus movement simulation stopped.',
    status: getSimulationStatus(),
  });
};

// @desc    Get simulation status
// @route   GET /api/simulation/status
// @access  Public
export const getStatus = (req, res) => {
  res.status(200).json({
    success: true,
    status: getSimulationStatus(),
  });
};
