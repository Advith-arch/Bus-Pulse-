import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  Clock,
  MapPin,
  Phone,
  User,
  Gauge,
  Play,
  Square,
  Sparkles,
  Info
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { Button } from '../common/Button.jsx';
import { useSocketContext } from '../../context/SocketContext.jsx';

// Component to dynamically re-center map on selected bus or route
const MapCenterController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13, { animate: true, duration: 1.0 });
    }
  }, [center, zoom, map]);
  return null;
};

// Create custom bus divIcon with animated status ring
const createBusIcon = (busNumber, status) => {
  const getStatusColor = () => {
    switch (status) {
      case 'On Time':
        return '#10B981'; // Emerald
      case 'Delayed':
        return '#F43F5E'; // Rose
      case 'Arriving':
        return '#2563EB'; // Blue
      default:
        return '#64748B'; // Slate
    }
  };

  const color = getStatusColor();

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="
          background: ${color};
          color: white;
          padding: 3px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          gap: 4px;
          border: 2px solid white;
          white-space: nowrap;
        ">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:white;"></span>
          ${busNumber}
        </div>
        <div style="
          width: 0; 
          height: 0; 
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [60, 40],
    iconAnchor: [30, 36],
    popupAnchor: [0, -36],
  });
};

// Create custom stop divIcon
const createStopIcon = (stopOrder, isSelected) => {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: ${isSelected ? '#2563EB' : 'white'};
        color: ${isSelected ? 'white' : '#1E293B'};
        border: 2px solid #2563EB;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 800;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      ">
        ${stopOrder}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
};

export const BusMap = ({
  buses = [],
  routes = [],
  selectedBusId = null,
  selectedRouteId = null,
  onSelectBus,
  height = 'h-[550px]',
  showControls = true,
}) => {
  const { isSimulating, toggleSimulation } = useSocketContext();
  const [mapCenter, setMapCenter] = useState([12.9550, 77.6200]);
  const [mapZoom, setMapZoom] = useState(12);

  // If a specific bus is selected, center on it
  useEffect(() => {
    if (selectedBusId) {
      const bus = buses.find((b) => b._id === selectedBusId);
      if (bus && bus.currentLocation?.lat && bus.currentLocation?.lng) {
        setMapCenter([bus.currentLocation.lat, bus.currentLocation.lng]);
        setMapZoom(14);
      }
    }
  }, [selectedBusId, buses]);

  // If a specific route is selected, center on its first waypoint
  useEffect(() => {
    if (selectedRouteId && !selectedBusId) {
      const route = routes.find((r) => r._id === selectedRouteId);
      if (route && route.coordinates && route.coordinates.length > 0) {
        setMapCenter(route.coordinates[0]);
        setMapZoom(13);
      }
    }
  }, [selectedRouteId, routes, selectedBusId]);

  // Determine active route polylines to display
  const activeRoutes = selectedRouteId
    ? routes.filter((r) => r._id === selectedRouteId)
    : routes;

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden border border-slate-200/90 shadow-soft bg-slate-100`}>
      {/* Floating Demo Mode Simulator Banner */}
      {showControls && (
        <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2">
          <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-soft flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulating ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="text-xs font-bold text-slate-800">
              {isSimulating ? 'DEMO SIMULATION ACTIVE' : 'SIMULATION PAUSED'}
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline border-l border-slate-200 pl-2">
              Smooth Route GPS Feed
            </span>
          </div>

          <Button
            size="sm"
            variant={isSimulating ? 'outline' : 'primary'}
            onClick={toggleSimulation}
            className="!py-1 !px-2.5 !text-xs !rounded-full shadow-soft"
          >
            {isSimulating ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Live GPS</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Map Element */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapCenterController center={mapCenter} zoom={mapZoom} />

        {/* Clean OpenStreetMap CartoDB Positron / OSM Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Route Polylines */}
        {activeRoutes.map((route, idx) => {
          const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706'];
          const routeColor = colors[idx % colors.length];

          return (
            <React.Fragment key={route._id || route.routeNumber}>
              {route.coordinates && route.coordinates.length > 1 && (
                <Polyline
                  positions={route.coordinates}
                  pathOptions={{
                    color: routeColor,
                    weight: 5,
                    opacity: 0.8,
                    lineJoin: 'round',
                    lineCap: 'round',
                  }}
                />
              )}

              {/* Render Route Stops */}
              {route.stops &&
                route.stops.map((stop) => (
                  <Marker
                    key={stop._id || `${route._id}-${stop.stopOrder}`}
                    position={[stop.lat, stop.lng]}
                    icon={createStopIcon(stop.stopOrder, false)}
                  >
                    <Popup className="rounded-xl">
                      <div className="p-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                          <MapPin className="w-3 h-3" />
                          <span>Stop #{stop.stopOrder} • {route.routeNumber}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mt-0.5">
                          {stop.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Estimated {stop.estimatedTimeFromStart || 0} mins from start point
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </React.Fragment>
          );
        })}

        {/* Render Live Moving Buses */}
        {buses.map((bus) => {
          if (!bus.currentLocation || !bus.currentLocation.lat || !bus.currentLocation.lng) {
            return null;
          }

          const routeName = bus.routeId?.routeName || 'Campus Transit Route';
          const nextStop = bus.eta?.nextStop || 'Next Campus Stop';
          const nextEta = bus.eta?.nextStopEtaMinutes || 5;

          return (
            <Marker
              key={bus._id}
              position={[bus.currentLocation.lat, bus.currentLocation.lng]}
              icon={createBusIcon(bus.busNumber, bus.status)}
              eventHandlers={{
                click: () => {
                  if (onSelectBus) onSelectBus(bus);
                },
              }}
            >
              <Popup className="bus-popup">
                <div className="p-2 min-w-[220px]">
                  {/* Bus Header */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="text-base font-extrabold text-slate-900 leading-tight">
                        {bus.busNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {bus.registrationNumber}
                      </div>
                    </div>
                    <Badge status={bus.status} />
                  </div>

                  {/* Route & ETA Details */}
                  <div className="py-2.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium text-slate-400">Route:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                        {routeName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-blue-50/70 p-1.5 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-1 text-blue-700 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Next: {nextStop}</span>
                      </div>
                      <div className="text-blue-900 font-extrabold text-sm">
                        {nextEta} min
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Gauge className="w-3.5 h-3.5" /> Speed:
                      </span>
                      <span className="font-semibold text-slate-700">{bus.speed} km/h</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-slate-400">
                        <User className="w-3.5 h-3.5" /> Driver:
                      </span>
                      <span className="font-semibold text-slate-700">{bus.driverName}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3.5 h-3.5" /> Phone:
                      </span>
                      <a
                        href={`tel:${bus.driverPhone}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {bus.driverPhone}
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>GPS Telemetry Active</span>
                    <span className="text-emerald-600 font-medium">Socket.IO Live</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
