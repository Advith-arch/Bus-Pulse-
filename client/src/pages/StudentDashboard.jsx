import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bus,
  Clock,
  MapPin,
  AlertTriangle,
  Bell,
  Radio,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocketContext } from '../context/SocketContext.jsx';
import { routeService } from '../services/routeService.js';
import { studentService } from '../services/studentService.js';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { StatCard } from '../components/common/StatCard.jsx';
import { BusCard } from '../components/cards/BusCard.jsx';
import { NotificationCard } from '../components/cards/NotificationCard.jsx';
import { BusMap } from '../components/map/BusMap.jsx';

export const StudentDashboard = () => {
  const { user, updateUser } = useAuth();
  const { buses, notifications, markNotificationRead } = useSocketContext();
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(
    user?.preferredRoute?._id || user?.preferredRoute || ''
  );
  const [updatingRoute, setUpdatingRoute] = useState(false);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const data = await routeService.getAllRoutes();
        setRoutes(data);
        if (!selectedRouteId && data.length > 0) {
          setSelectedRouteId(data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load routes in dashboard:', err);
      }
    };
    loadRoutes();
  }, [selectedRouteId]);

  // Find preferred route and assigned buses
  const currentRoute = routes.find((r) => r._id === selectedRouteId) || routes[0];

  const assignedBuses = buses.filter((b) => {
    const rId = b.routeId?._id || b.routeId;
    return rId === currentRoute?._id;
  });

  const primaryBus = assignedBuses[0] || buses[0];

  const handleRouteChange = async (e) => {
    const newRouteId = e.target.value;
    setSelectedRouteId(newRouteId);
    setUpdatingRoute(true);
    try {
      if (user?.id || user?._id) {
        await studentService.updatePreferredRoute(user.id || user._id, newRouteId);
        updateUser({ preferredRoute: newRouteId });
      }
    } catch (err) {
      console.warn('Failed to persist preferred route update:', err);
    } finally {
      setUpdatingRoute(false);
    }
  };

  const handleTrackBus = (bus) => {
    navigate(`/tracking?busId=${bus._id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft-blue flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Commuter Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            {user?.department} • {user?.year} • Student ID: <span className="font-mono">{user?.studentId || 'N/A'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/tracking">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-slate-100 border-white shadow-lg text-xs sm:text-sm"
            >
              <Radio className="w-4 h-4 text-blue-600" />
              <span>Open Live Map</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Assigned Bus"
          value={primaryBus ? primaryBus.busNumber : 'Awaiting'}
          subtitle={primaryBus?.registrationNumber || 'No bus assigned'}
          icon={Bus}
          color="blue"
        />

        <StatCard
          title="Live Bus Status"
          value={primaryBus?.status || 'Active'}
          subtitle={primaryBus?.status === 'Delayed' ? 'Expect 12-15m traffic delay' : 'Running on schedule'}
          icon={Clock}
          color={primaryBus?.status === 'Delayed' ? 'rose' : 'emerald'}
          badgeText={primaryBus?.status}
        />

        <StatCard
          title="Next Stop"
          value={primaryBus?.eta?.nextStop || 'Campus Main Gate'}
          subtitle={primaryBus?.eta ? `${primaryBus.eta.nextStopDistanceKm || 0} km away` : 'Estimated approaching'}
          icon={MapPin}
          color="indigo"
        />

        <StatCard
          title="Estimated Arrival"
          value={primaryBus?.eta ? `${primaryBus.eta.nextStopEtaMinutes} min` : '5-8 min'}
          subtitle="Real-time Haversine ETA"
          icon={Compass}
          color="amber"
          badgeText="Live"
        />
      </div>

      {/* Preferred Route Switcher Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Active College Route
            </span>
            <span className="text-base font-bold text-slate-800">
              {currentRoute?.routeNumber} – {currentRoute?.routeName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Switch Route:
          </span>
          <select
            value={selectedRouteId}
            onChange={handleRouteChange}
            disabled={updatingRoute}
            className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeNumber} ({r.startPoint} to Campus)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Mini Map & Route Telemetry Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Live Map Telemetry
            </h2>
            <p className="text-xs text-slate-500">
              Real-time vehicle coordinates streaming via WebSockets
            </p>
          </div>
          <Link to="/tracking" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            <span>Fullscreen View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <BusMap
          buses={buses}
          routes={routes}
          selectedRouteId={currentRoute?._id}
          height="h-[380px]"
          onSelectBus={handleTrackBus}
        />
      </div>

      {/* Two Column Section: Available Buses & Recent Delay/Alert Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Available Buses (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Available College Buses
              </h2>
              <p className="text-xs text-slate-500">
                All 5 campus transit fleet vehicles with live telematics
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {buses.length} Fleet Buses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buses.map((bus) => (
              <BusCard
                key={bus._id}
                bus={bus}
                onTrack={handleTrackBus}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Real-time Transit Notifications (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Transit Alerts
              </h2>
              <p className="text-xs text-slate-500">
                Live delay notices and schedule updates
              </p>
            </div>
            <Link
              to="/notifications"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 4).map((notif) => (
              <NotificationCard
                key={notif._id}
                notification={notif}
                onMarkRead={markNotificationRead}
              />
            ))}
            {notifications.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No active notifications. All buses operating normally.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
