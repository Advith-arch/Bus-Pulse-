/**
 * ETA calculation service using Haversine formula, bus speed,
 * route waypoints, and delay factor adjustments.
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculate great-circle distance between two coordinates in km
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

/**
 * Calculate ETA for all stops on a bus route
 * @param {Object} bus - Bus object with currentLocation, speed, status
 * @param {Object} route - Route object with stops and coordinates
 * @returns {Object} { nextStop, stopETAs, remainingDistanceKm, remainingDurationMin }
 */
export const calculateRouteETA = (bus, route) => {
  if (!bus || !bus.currentLocation || !route || !route.stops || route.stops.length === 0) {
    return {
      nextStop: null,
      stopETAs: [],
      remainingDistanceKm: 0,
      remainingDurationMin: 0,
    };
  }

  const busLat = bus.currentLocation.lat;
  const busLng = bus.currentLocation.lng;
  // Effective speed in km/h (minimum 20 km/h to prevent divide-by-zero when idling)
  const effectiveSpeed = Math.max(bus.speed || 30, 20);
  const isDelayed = bus.status === 'Delayed';
  const delayBufferMin = isDelayed ? 12 : 0;

  let minDistanceToStop = Infinity;
  let nextStop = null;
  let nextStopIndex = 0;

  // Calculate distance from bus to each stop
  const stopETAs = route.stops.map((stop, index) => {
    const distKm = calculateDistance(busLat, busLng, stop.lat, stop.lng);
    // Base travel time in minutes
    let etaMinutes = Math.round((distKm / effectiveSpeed) * 60) + delayBufferMin;
    if (etaMinutes < 1) etaMinutes = 1;

    // Track upcoming next stop (closest stop ahead)
    if (distKm < minDistanceToStop) {
      minDistanceToStop = distKm;
      nextStop = stop;
      nextStopIndex = index;
    }

    return {
      stopId: stop._id || `stop-${index}`,
      stopName: stop.name,
      stopOrder: stop.stopOrder,
      distanceKm: parseFloat(distKm.toFixed(2)),
      etaMinutes,
      status: etaMinutes <= 3 ? 'Arriving' : isDelayed ? 'Delayed' : 'On Time',
    };
  });

  // Calculate remaining distance to destination (last stop)
  const lastStop = route.stops[route.stops.length - 1];
  const totalRemainingDistance = calculateDistance(busLat, busLng, lastStop.lat, lastStop.lng);
  let totalRemainingMinutes = Math.round((totalRemainingDistance / effectiveSpeed) * 60) + delayBufferMin;
  if (totalRemainingMinutes < 1) totalRemainingMinutes = 1;

  return {
    nextStop: nextStop ? nextStop.name : (route.stops[0]?.name || 'Destination'),
    nextStopDistanceKm: parseFloat(minDistanceToStop.toFixed(2)),
    nextStopEtaMinutes: stopETAs[nextStopIndex]?.etaMinutes || 5,
    stopETAs,
    remainingDistanceKm: parseFloat(totalRemainingDistance.toFixed(2)),
    remainingDurationMin: totalRemainingMinutes,
    calculationMethod: 'Haversine Route Velocity Metric (Estimated)',
  };
};
