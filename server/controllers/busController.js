import { dataStore } from '../services/dataStore.js';
import { calculateRouteETA } from '../services/etaService.js';
import { emitBusLocation, emitBusStatus, emitNotification } from '../sockets/busSocket.js';

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
export const getAllBuses = async (req, res, next) => {
  try {
    const buses = await dataStore.bus.find();
    const routes = await dataStore.route.find();

    // Enrich buses with live ETA calculations
    const enrichedBuses = buses.map((bus) => {
      const routeId = bus.routeId?._id || bus.routeId;
      const route = routes.find((r) => r._id === routeId);
      const eta = route ? calculateRouteETA(bus, route) : null;
      return {
        ...bus,
        eta,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedBuses.length,
      data: enrichedBuses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bus by ID
// @route   GET /api/buses/:id
// @access  Public
export const getBusById = async (req, res, next) => {
  try {
    const bus = await dataStore.bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.',
      });
    }

    const routeId = bus.routeId?._id || bus.routeId;
    const route = routeId ? await dataStore.route.findById(routeId) : null;
    const eta = route ? calculateRouteETA(bus, route) : null;

    res.status(200).json({
      success: true,
      data: {
        ...bus,
        eta,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new bus
// @route   POST /api/buses
// @access  Private/Admin
export const createBus = async (req, res, next) => {
  try {
    const { busNumber, registrationNumber, driverName, driverPhone, routeId, status, speed, currentLocation } = req.body;

    if (!busNumber || !registrationNumber || !driverName || !driverPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bus number, registration, driver name, and phone number.',
      });
    }

    // Default to route start location if available
    let location = currentLocation;
    if (!location && routeId) {
      const route = await dataStore.route.findById(routeId);
      if (route && route.stops && route.stops.length > 0) {
        location = { lat: route.stops[0].lat, lng: route.stops[0].lng };
      }
    }

    const newBus = await dataStore.bus.create({
      busNumber,
      registrationNumber,
      driverName,
      driverPhone,
      routeId: routeId || null,
      status: status || 'On Time',
      speed: speed || 35,
      currentLocation: location || { lat: 12.9352, lng: 77.6245 },
    });

    res.status(201).json({
      success: true,
      message: 'Bus added successfully.',
      data: newBus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bus
// @route   PUT /api/buses/:id
// @access  Private/Admin
export const updateBus = async (req, res, next) => {
  try {
    const bus = await dataStore.bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.',
      });
    }

    const updatedBus = await dataStore.bus.findByIdAndUpdate(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully.',
      data: updatedBus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bus
// @route   DELETE /api/buses/:id
// @access  Private/Admin
export const deleteBus = async (req, res, next) => {
  try {
    const bus = await dataStore.bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.',
      });
    }

    await dataStore.bus.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bus location (GPS driver feed API)
// @route   PATCH /api/buses/:id/location
// @access  Public or Private (Driver/Admin)
export const updateBusLocation = async (req, res, next) => {
  try {
    const { lat, lng, speed } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid latitude and longitude coordinates.',
      });
    }

    const bus = await dataStore.bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.',
      });
    }

    const updatePayload = {
      currentLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
      lastUpdated: new Date(),
    };
    if (speed !== undefined) updatePayload.speed = parseFloat(speed);

    const updatedBus = await dataStore.bus.findByIdAndUpdate(req.params.id, updatePayload);

    // Calculate updated ETA and broadcast
    const routeId = updatedBus.routeId?._id || updatedBus.routeId;
    const route = routeId ? await dataStore.route.findById(routeId) : null;
    const eta = route ? calculateRouteETA(updatedBus, route) : null;

    emitBusLocation(updatedBus, eta);

    res.status(200).json({
      success: true,
      message: 'Bus location updated and broadcasted in real time.',
      data: {
        ...updatedBus,
        eta,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bus status (e.g. Delayed, Arriving, On Time)
// @route   PATCH /api/buses/:id/status
// @access  Private/Admin
export const updateBusStatus = async (req, res, next) => {
  try {
    const { status, delayReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status.',
      });
    }

    const bus = await dataStore.bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.',
      });
    }

    const updatedBus = await dataStore.bus.findByIdAndUpdate(req.params.id, {
      status,
      lastUpdated: new Date(),
    });

    emitBusStatus(updatedBus);

    // If marked as Delayed, automatically generate a notification and broadcast it!
    if (status === 'Delayed') {
      const routeId = updatedBus.routeId?._id || updatedBus.routeId;
      const notifMessage = delayReason || `${updatedBus.busNumber} is currently delayed due to traffic congestion or operational slowdown.`;
      const notif = await dataStore.notification.create({
        title: `${updatedBus.busNumber} Delayed`,
        message: notifMessage,
        type: 'delay',
        busId: updatedBus._id,
        routeId: routeId || null,
      });

      emitNotification(notif);
    }

    res.status(200).json({
      success: true,
      message: `Bus status updated to "${status}".`,
      data: updatedBus,
    });
  } catch (error) {
    next(error);
  }
};
