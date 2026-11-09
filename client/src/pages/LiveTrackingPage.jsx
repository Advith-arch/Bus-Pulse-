import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bus,
  MapPin,
  Clock,
  Gauge,
  Phone,
  Radio,
  SlidersHorizontal,
  Compass,
  Info,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useSocketContext } from '../context/SocketContext.jsx';
import { routeService } from '../services/routeService.js';
import { BusMap } from '../components/map/BusMap.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';

export const LiveTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const initialBusId = searchParams.get('busId');

  const { buses, isSimulating, toggleSimulation } = useSocketContext();
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('ALL');
  const [selectedBusId, setSelectedBusId] = useState(initialBusId || null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routesData = await routeService.getAllRoutes();
        setRoutes(routesData);
      } catch (err) {
        console.error('Failed to load routes in tracking page:', err);
      }
    };
    fetchRoutes();
  }, []);

  // Update selected bus if initial query param provided
  useEffect(() => {
    if (initialBusId && buses.length > 0) {
      setSelectedBusId(initialBusId);
      const found = buses.find((b) => b._id === initialBusId);
      if (found && found.routeId) {
        setSelectedRouteId(found.routeId._id || found.routeId);
      }
    } else if (!selectedBusId && buses.length > 0) {
      setSelectedBusId(buses[0]._id);
    }
  }, [initialBusId, buses, selectedBusId]);

  // Filtered buses based on route selection
  const filteredBuses = selectedRouteId === 'ALL'
    ? buses
    : buses.filter((b) => (b.routeId?._id || b.routeId) === selectedRouteId);

  // Active inspected bus
  const activeBus = buses.find((b) => b._id === selectedBusId) || filteredBuses[0] || buses[0];
  const activeRouteId = activeBus?.routeId?._id || activeBus?.routeId;
  const activeRoute = routes.find((r) => r._id === activeRouteId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Fleet Map Telematics
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time GPS coordinates broadcasted via Node.js Socket.IO cluster
          </p>
        </div>

        {/* Route Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Filter Route:</span>
          </div>

          <select
            value={selectedRouteId}
            onChange={(e) => {
              setSelectedRouteId(e.target.value);
              setSelectedBusId(null);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Campus Routes (4 Routes)</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeNumber} – {r.routeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bus Quick Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filteredBuses.map((bus) => {
          const isSelected = activeBus?._id === bus._id;
          return (
            <button
              key={bus._id}
              onClick={() => setSelectedBusId(bus._id)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-soft-blue scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>{bus.busNumber}</span>
              <Badge status={bus.status} className="!text-[10px] !py-0 !px-1.5" />
            </button>
          );
        })}
      </div>

      {/* Grid: Map (Left/Center) & Active Bus Details Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View Container (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <BusMap
            buses={filteredBuses}
            routes={routes}
            selectedBusId={activeBus?._id}
            selectedRouteId={selectedRouteId === 'ALL' ? null : selectedRouteId}
            height="h-[600px]"
            onSelectBus={(bus) => setSelectedBusId(bus._id)}
          />

          {/* Map Legend & Methodology Disclaimer */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> On Time
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Delayed
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Arriving
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <span>ETA computed using real-time Haversine geodesic velocity metric</span>
            </div>
          </div>
        </div>

        {/* Selected Bus Inspection Drawer (1 col) */}
        <div className="space-y-4">
          {activeBus ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-6">
              {/* Bus Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {activeBus.busNumber}
                    </h3>
                    <Badge status={activeBus.status} />
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Plate: {activeBus.registrationNumber}
                  </p>
                </div>
              </div>

              {/* ETA Highlight Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-soft-blue space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                  Next Stop Forecast
                </span>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-lg font-bold truncate max-w-[170px]">
                    {activeBus.eta?.nextStop || 'Approaching Stop'}
                  </h4>
                  <div className="text-3xl font-black">
                    {activeBus.eta?.nextStopEtaMinutes || 5}
                    <span className="text-xs font-bold text-blue-200 ml-1">min</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
                  <span>Distance to stop:</span>
                  <span className="font-bold">{activeBus.eta?.nextStopDistanceKm || 0} km</span>
                </div>
              </div>

              {/* Telematics Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block font-medium">Telemetry Speed</span>
                  <div className="text-base font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Gauge className="w-4 h-4 text-blue-600" />
                    <span>{activeBus.speed} km/h</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block font-medium">Assigned Route</span>
                  <div className="text-xs font-bold text-slate-800 truncate mt-1">
                    {activeRoute?.routeNumber || 'R-101'}
                  </div>
                </div>
              </div>

              {/* Driver Contact Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Assigned Driver
                  </span>
                  <span className="text-sm font-bold text-slate-800 block">
                    {activeBus.driverName}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {activeBus.driverPhone}
                  </span>
                </div>
                <a
                  href={`tel:${activeBus.driverPhone}`}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-soft transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Route Stops Sequence */}
              {activeRoute && activeRoute.stops && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Route Waypoint Stops ({activeRoute.stops.length})
                  </h4>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activeRoute.stops.map((stop, idx) => {
                      const isNext = activeBus.eta?.nextStop === stop.name;
                      return (
                        <div
                          key={stop._id || idx}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                            isNext
                              ? 'bg-blue-50/90 border-blue-200 text-blue-900 font-bold'
                              : 'bg-white border-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                                isNext
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {stop.stopOrder}
                            </span>
                            <span className="truncate">{stop.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {stop.estimatedTimeFromStart}m mark
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              Select a bus from the map or filter pills to inspect live telematics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
