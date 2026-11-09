import { dataStore } from '../services/dataStore.js';

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
export const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await dataStore.route.find();
    const buses = await dataStore.bus.find();

    // Attach assigned buses to each route
    const enrichedRoutes = routes.map((route) => {
      const assignedBuses = buses.filter((b) => {
        const busRouteId = b.routeId?._id || b.routeId;
        return busRouteId === route._id;
      });

      return {
        ...route,
        assignedBuses,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedRoutes.length,
      data: enrichedRoutes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single route by ID
// @route   GET /api/routes/:id
// @access  Public
export const getRouteById = async (req, res, next) => {
  try {
    const route = await dataStore.route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found.',
      });
    }

    const buses = await dataStore.bus.find();
    const assignedBuses = buses.filter((b) => {
      const busRouteId = b.routeId?._id || b.routeId;
      return busRouteId === route._id;
    });

    res.status(200).json({
      success: true,
      data: {
        ...route,
        assignedBuses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new route
// @route   POST /api/routes
// @access  Private/Admin
export const createRoute = async (req, res, next) => {
  try {
    const { routeName, routeNumber, startPoint, destination, stops, coordinates, estimatedDuration } = req.body;

    if (!routeName || !routeNumber || !startPoint || !destination || !estimatedDuration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide route name, route number, start point, destination, and estimated duration.',
      });
    }

    const newRoute = await dataStore.route.create({
      routeName,
      routeNumber,
      startPoint,
      destination,
      stops: stops || [],
      coordinates: coordinates || [],
      estimatedDuration: Number(estimatedDuration),
    });

    res.status(201).json({
      success: true,
      message: 'Route created successfully.',
      data: newRoute,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private/Admin
export const updateRoute = async (req, res, next) => {
  try {
    const route = await dataStore.route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found.',
      });
    }

    const updatedRoute = await dataStore.route.findByIdAndUpdate(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Route updated successfully.',
      data: updatedRoute,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private/Admin
export const deleteRoute = async (req, res, next) => {
  try {
    const route = await dataStore.route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found.',
      });
    }

    await dataStore.route.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
