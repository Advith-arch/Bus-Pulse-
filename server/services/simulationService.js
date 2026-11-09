import { dataStore } from './dataStore.js';
import { calculateRouteETA } from './etaService.js';
import { emitBusLocation, emitSimulationStatus } from '../sockets/busSocket.js';

let isSimulating = false;
let simulationInterval = null;

// Track progress for each bus: { busId: { waypointIndex: number, stepProgress: number, direction: 1 | -1 } }
const busProgress = new Map();

/**
 * Linear interpolation between two coordinates
 */
const interpolate = (p1, p2, factor) => {
  return [
    p1[0] + (p2[0] - p1[0]) * factor,
    p1[1] + (p2[1] - p1[1]) * factor,
  ];
};

/**
 * Step simulation tick
 */
const simulationTick = async () => {
  try {
    const buses = await dataStore.bus.find();
    const routes = await dataStore.route.find();

    for (const bus of buses) {
      if (!bus.routeId) continue;
      const routeId = bus.routeId._id ? bus.routeId._id : bus.routeId;
      const route = routes.find((r) => r._id === routeId);

      if (!route || !route.coordinates || route.coordinates.length < 2) continue;

      let progress = busProgress.get(bus._id);
      if (!progress) {
        progress = {
          waypointIndex: Math.floor(Math.random() * (route.coordinates.length - 1)),
          stepProgress: 0,
          direction: 1,
        };
        busProgress.set(bus._id, progress);
      }

      // Increment progress along the segment
      progress.stepProgress += 0.2; // Move 20% along segment per tick

      if (progress.stepProgress >= 1.0) {
        progress.stepProgress = 0;
        progress.waypointIndex += progress.direction;

        // Bounce back or loop
        if (progress.waypointIndex >= route.coordinates.length - 1) {
          progress.direction = -1;
          progress.waypointIndex = route.coordinates.length - 1;
        } else if (progress.waypointIndex <= 0) {
          progress.direction = 1;
          progress.waypointIndex = 0;
        }
      }

      const p1 = route.coordinates[progress.waypointIndex];
      const nextIdx = progress.direction === 1 ? progress.waypointIndex + 1 : progress.waypointIndex - 1;
      const p2 = route.coordinates[Math.max(0, Math.min(nextIdx, route.coordinates.length - 1))];

      const [newLat, newLng] = interpolate(p1, p2, progress.stepProgress);

      // Randomize speed slightly for realistic variance (25 to 45 km/h)
      const dynamicSpeed = Math.floor(28 + Math.random() * 15);

      // Calculate ETA
      const updatedBusData = {
        currentLocation: {
          lat: parseFloat(newLat.toFixed(6)),
          lng: parseFloat(newLng.toFixed(6)),
        },
        speed: dynamicSpeed,
        lastUpdated: new Date(),
      };

      const updatedBus = await dataStore.bus.findByIdAndUpdate(bus._id, updatedBusData);
      if (updatedBus) {
        const eta = calculateRouteETA(updatedBus, route);
        emitBusLocation(updatedBus, eta);
      }
    }
  } catch (err) {
    console.error('[Simulator] Error during simulation tick:', err.message);
  }
};

export const startSimulation = () => {
  if (isSimulating) return true;
  isSimulating = true;
  simulationInterval = setInterval(simulationTick, 2500); // Update every 2.5s
  emitSimulationStatus({ isSimulating: true });
  console.log('[Simulator] Live GPS demo simulation STARTED.');
  return true;
};

export const stopSimulation = () => {
  if (!isSimulating) return false;
  isSimulating = false;
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  emitSimulationStatus({ isSimulating: false });
  console.log('[Simulator] Live GPS demo simulation STOPPED.');
  return false;
};

export const getSimulationStatus = () => {
  return {
    isSimulating,
    activeBusesCount: busProgress.size,
    tickIntervalMs: 2500,
  };
};
