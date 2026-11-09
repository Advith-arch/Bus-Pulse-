let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for specific bus or route if requested
    socket.on('join_bus', (busId) => {
      socket.join(`bus_${busId}`);
      console.log(`[Socket.IO] Client ${socket.id} subscribed to bus_${busId}`);
    });

    socket.on('leave_bus', (busId) => {
      socket.leave(`bus_${busId}`);
      console.log(`[Socket.IO] Client ${socket.id} unsubscribed from bus_${busId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return ioInstance;
};

/**
 * Broadcast live bus location & ETA to all connected clients
 */
export const emitBusLocation = (bus, eta) => {
  if (!ioInstance) return;
  ioInstance.emit('bus_location_update', {
    busId: bus._id,
    busNumber: bus.busNumber,
    currentLocation: bus.currentLocation,
    status: bus.status,
    speed: bus.speed,
    lastUpdated: bus.lastUpdated,
    eta,
  });
};

/**
 * Broadcast status change (e.g. Delayed, Arriving, On Time)
 */
export const emitBusStatus = (bus) => {
  if (!ioInstance) return;
  ioInstance.emit('bus_status_update', {
    busId: bus._id,
    busNumber: bus.busNumber,
    status: bus.status,
  });
};

/**
 * Broadcast new notification (delay alert, route change, etc.)
 */
export const emitNotification = (notification) => {
  if (!ioInstance) return;
  ioInstance.emit('new_notification', notification);
};

/**
 * Broadcast simulation state toggle
 */
export const emitSimulationStatus = (status) => {
  if (!ioInstance) return;
  ioInstance.emit('simulation_state_changed', status);
};
