import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, MapPin, Clock, Bus, ChevronRight, Navigation, CheckCircle2 } from 'lucide-react';
import { routeService } from '../services/routeService.js';
import { useSocketContext } from '../context/SocketContext.jsx';
import { RouteCard } from '../components/cards/RouteCard.jsx';
import { BusMap } from '../components/map/BusMap.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const { buses } = useSocketContext();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await routeService.getAllRoutes();
        setRoutes(data);
        if (data.length > 0) {
          setSelectedRoute(data[0]);
        }
      } catch (err) {
        console.error('Failed to load routes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading campus routes..." />
      </div>
    );
  }

  // Assigned buses for the selected route
  const assignedBuses = buses.filter((b) => {
    const rId = b.routeId?._id || b.routeId;
    return rId === selectedRoute?._id;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
          <RouteIcon className="w-3.5 h-3.5" />
          <span>Campus Transit Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          College Bus Routes & Stops
        </h1>
        <p className="text-xs text-slate-500">
          Official university bus timetables, intermediate boarding points, and vehicle allocations
        </p>
      </div>

      {/* Route Cards Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {routes.map((route) => (
          <RouteCard
            key={route._id}
            route={route}
            isSelected={selectedRoute?._id === route._id}
            onSelect={(r) => setSelectedRoute(r)}
          />
        ))}
      </div>

      {/* Selected Route Detailed View & Map */}
      {selectedRoute && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-8">
          {/* Route Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {selectedRoute.routeNumber}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {selectedRoute.routeName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedRoute.startPoint} to {selectedRoute.destination}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Total Travel Duration
                </span>
                <span className="text-lg font-black text-slate-800">
                  {selectedRoute.estimatedDuration} Minutes
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Buses Bar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Assigned Fleet Buses ({assignedBuses.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {assignedBuses.map((bus) => (
                <div
                  key={bus._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{bus.busNumber}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {bus.driverName}
                      </p>
                    </div>
                  </div>
                  <Badge status={bus.status} />
                </div>
              ))}
              {assignedBuses.length === 0 && (
                <div className="col-span-full p-4 text-xs text-slate-400 bg-slate-50 rounded-xl text-center">
                  No buses currently assigned to this route.
                </div>
              )}
            </div>
          </div>

          {/* Interactive Route Map */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interactive Route Polyline & Stops Map
            </h3>
            <BusMap
              routes={[selectedRoute]}
              buses={assignedBuses}
              selectedRouteId={selectedRoute._id}
              height="h-[420px]"
              showControls={false}
            />
          </div>

          {/* Stop Waypoint Sequence Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Boarding Stops Timeline ({selectedRoute.stops?.length || 0} Designated Stops)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedRoute.stops?.map((stop) => (
                <div
                  key={stop._id || stop.stopOrder}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm flex items-start gap-3 hover:border-blue-300 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {stop.stopOrder}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-800 truncate">
                      {stop.name}
                    </h5>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Stop #{stop.stopOrder}</span>
                      <span className="font-semibold text-blue-600">
                        {stop.estimatedTimeFromStart} mins from start
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
