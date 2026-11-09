import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Bus,
  Route as RouteIcon,
  Users,
  AlertTriangle,
  Plus,
  Play,
  Square,
  Edit2,
  Trash2,
  Bell,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Search
} from 'lucide-react';
import { useSocketContext } from '../context/SocketContext.jsx';
import { busService } from '../services/busService.js';
import { routeService } from '../services/routeService.js';
import { studentService } from '../services/studentService.js';
import { notificationService } from '../services/notificationService.js';
import { StatCard } from '../components/common/StatCard.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const AdminDashboard = () => {
  const { buses, notifications, isSimulating, toggleSimulation, refreshData } = useSocketContext();

  const [activeTab, setActiveTab] = useState('buses'); // 'buses' | 'routes' | 'drivers' | 'students' | 'notifications'
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [busModalOpen, setBusModalOpen] = useState(false);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Forms state
  const [editingBus, setEditingBus] = useState(null);
  const [busForm, setBusForm] = useState({
    busNumber: '',
    registrationNumber: '',
    driverName: '',
    driverPhone: '',
    routeId: '',
    status: 'On Time',
    speed: 35,
  });

  const [editingRoute, setEditingRoute] = useState(null);
  const [routeForm, setRouteForm] = useState({
    routeName: '',
    routeNumber: '',
    startPoint: '',
    destination: 'Apex University Main Campus',
    estimatedDuration: 40,
    stops: [
      { name: '', lat: 12.9716, lng: 77.5946, stopOrder: 1, estimatedTimeFromStart: 0 },
    ],
  });

  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    type: 'delay',
    busId: '',
    routeId: '',
  });

  const [statusTargetBus, setStatusTargetBus] = useState(null);
  const [newStatus, setNewStatus] = useState('Delayed');
  const [delayReason, setDelayReason] = useState('Traffic congestion near arterial junction.');

  // Fetch routes and students
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [routesData, studentsData] = await Promise.all([
        routeService.getAllRoutes(),
        studentService.getAllStudents(),
      ]);
      setRoutes(routesData);
      setStudents(studentsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Compute KPI metrics
  const totalBuses = buses.length;
  const activeBuses = buses.filter((b) => b.status !== 'Inactive').length;
  const delayedBuses = buses.filter((b) => b.status === 'Delayed').length;
  const totalRoutes = routes.length;
  const totalStudents = students.length;

  // BUS CRUD HANDLERS
  const handleOpenAddBus = () => {
    setEditingBus(null);
    setBusForm({
      busNumber: '',
      registrationNumber: '',
      driverName: '',
      driverPhone: '',
      routeId: routes[0]?._id || '',
      status: 'On Time',
      speed: 35,
    });
    setBusModalOpen(true);
  };

  const handleOpenEditBus = (bus) => {
    setEditingBus(bus);
    setBusForm({
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      driverName: bus.driverName,
      driverPhone: bus.driverPhone,
      routeId: bus.routeId?._id || bus.routeId || '',
      status: bus.status,
      speed: bus.speed,
    });
    setBusModalOpen(true);
  };

  const handleSaveBus = async (e) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await busService.updateBus(editingBus._id, busForm);
      } else {
        await busService.createBus(busForm);
      }
      setBusModalOpen(false);
      refreshData();
    } catch (err) {
      alert(`Error saving bus: ${err.message}`);
    }
  };

  const handleDeleteBus = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await busService.deleteBus(id);
        refreshData();
      } catch (err) {
        alert(`Error deleting bus: ${err.message}`);
      }
    }
  };

  // QUICK STATUS MODAL
  const handleOpenStatusModal = (bus) => {
    setStatusTargetBus(bus);
    setNewStatus(bus.status === 'Delayed' ? 'On Time' : 'Delayed');
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!statusTargetBus) return;
    try {
      await busService.updateBusStatus(statusTargetBus._id, {
        status: newStatus,
        delayReason: newStatus === 'Delayed' ? delayReason : undefined,
      });
      setStatusModalOpen(false);
      refreshData();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // ROUTE CRUD HANDLERS
  const handleOpenAddRoute = () => {
    setEditingRoute(null);
    setRouteForm({
      routeName: '',
      routeNumber: '',
      startPoint: '',
      destination: 'Apex University Main Campus',
      estimatedDuration: 40,
      stops: [
        { name: 'Start Junction', lat: 12.9800, lng: 77.6000, stopOrder: 1, estimatedTimeFromStart: 0 },
        { name: 'Apex University Main Campus', lat: 12.9352, lng: 77.6245, stopOrder: 2, estimatedTimeFromStart: 40 },
      ],
    });
    setRouteModalOpen(true);
  };

  const handleOpenEditRoute = (route) => {
    setEditingRoute(route);
    setRouteForm({
      routeName: route.routeName,
      routeNumber: route.routeNumber,
      startPoint: route.startPoint,
      destination: route.destination,
      estimatedDuration: route.estimatedDuration,
      stops: route.stops || [],
    });
    setRouteModalOpen(true);
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();
    try {
      // Default coordinates from stops if not explicitly provided
      const coords = routeForm.stops.map((s) => [s.lat, s.lng]);
      const payload = { ...routeForm, coordinates: coords };

      if (editingRoute) {
        await routeService.updateRoute(editingRoute._id, payload);
      } else {
        await routeService.createRoute(payload);
      }
      setRouteModalOpen(false);
      loadAdminData();
    } catch (err) {
      alert(`Error saving route: ${err.message}`);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await routeService.deleteRoute(id);
        loadAdminData();
      } catch (err) {
        alert(`Error deleting route: ${err.message}`);
      }
    }
  };

  // NOTIFICATION BROADCAST HANDLER
  const handleOpenBroadcastNotif = () => {
    setNotifForm({
      title: '',
      message: '',
      type: 'delay',
      busId: buses[0]?._id || '',
      routeId: routes[0]?._id || '',
    });
    setNotifModalOpen(true);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await notificationService.createNotification(notifForm);
      setNotifModalOpen(false);
      refreshData();
      alert('Notification broadcasted to all students via WebSockets!');
    } catch (err) {
      alert(`Error sending notification: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-soft-blue font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Transit Administration Control
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet telematics, route planning, driver rosters, and real-time student broadcasting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadAdminData();
              refreshData();
            }}
            icon={RefreshCw}
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenBroadcastNotif}
            icon={Bell}
          >
            Broadcast Alert
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Buses"
          value={totalBuses}
          subtitle="Fleet Inventory"
          icon={Bus}
          color="blue"
        />
        <StatCard
          title="Active Buses"
          value={activeBuses}
          subtitle="On Route"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Delayed Buses"
          value={delayedBuses}
          subtitle="Traffic Slowdown"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Total Routes"
          value={totalRoutes}
          subtitle="Transit Corridors"
          icon={RouteIcon}
          color="indigo"
        />
        <StatCard
          title="Students"
          value={totalStudents}
          subtitle="Registered Commuters"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Simulator Control Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <RefreshCw className={`w-6 h-6 ${isSimulating ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Live GPS Route Telematics Simulator
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isSimulating ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {isSimulating ? '● SIMULATION RUNNING' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Simulates realistic GPS movement along route coordinates at 30-45 km/h and broadcasts live 2.5s location and ETA packets over WebSockets.
            </p>
          </div>
        </div>

        <Button
          variant={isSimulating ? 'danger' : 'primary'}
          size="md"
          onClick={toggleSimulation}
          className="shrink-0 font-semibold"
        >
          {isSimulating ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Halt Simulator</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Start Live Simulation</span>
            </>
          )}
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'buses', label: 'Bus Management', icon: Bus, count: buses.length },
          { id: 'routes', label: 'Route Network', icon: RouteIcon, count: routes.length },
          { id: 'drivers', label: 'Driver Rosters', icon: Phone, count: buses.length },
          { id: 'students', label: 'Student Registrations', icon: Users, count: students.length },
          { id: 'notifications', label: 'Notification Logs', icon: Bell, count: notifications.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white shadow-soft-blue'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: BUSES */}
      {activeTab === 'buses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">College Bus Fleet</h2>
            <Button size="sm" variant="primary" onClick={handleOpenAddBus} icon={Plus}>
              Add New Bus
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Bus #</th>
                    <th className="px-6 py-4">Reg Plate</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Driver</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Speed</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buses.map((bus) => (
                    <tr key={bus._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{bus.busNumber}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{bus.registrationNumber}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-700">
                          {bus.routeId?.routeName || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{bus.driverName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{bus.driverPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={bus.status} />
                      </td>
                      <td className="px-6 py-4 font-medium">{bus.speed} km/h</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenStatusModal(bus)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={() => handleOpenEditBus(bus)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBus(bus._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ROUTES */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Campus Transit Routes</h2>
            <Button size="sm" variant="primary" onClick={handleOpenAddRoute} icon={Plus}>
              Add New Route
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Route #</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Trajectory</th>
                    <th className="px-6 py-4">Stops</th>
                    <th className="px-6 py-4">Est. Duration</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.map((route) => (
                    <tr key={route._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-600">{route.routeNumber}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{route.routeName}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {route.startPoint} → {route.destination}
                      </td>
                      <td className="px-6 py-4 font-medium">{route.stops?.length || 0} stops</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{route.estimatedDuration} mins</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditRoute(route)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(route._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DRIVERS */}
      {activeTab === 'drivers' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Campus Driver Directory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map((bus) => (
              <div
                key={bus._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
                  {bus.driverName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">{bus.driverName}</h4>
                  <a
                    href={`tel:${bus.driverPhone}`}
                    className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{bus.driverPhone}</span>
                  </a>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Bus: <strong className="text-slate-700">{bus.busNumber}</strong></span>
                    <Badge status={bus.status} className="!text-[10px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Registered Students</h2>
            <span className="text-xs text-slate-400">{students.length} Total Enrolled</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Student ID</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Year</th>
                    <th className="px-6 py-4">Preferred Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-[11px] text-slate-400">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium">{student.studentId || 'N/A'}</td>
                      <td className="px-6 py-4 font-medium">{student.department || 'General'}</td>
                      <td className="px-6 py-4 text-slate-500">{student.year || 'N/A'}</td>
                      <td className="px-6 py-4 font-semibold text-blue-600">
                        {student.preferredRoute?.routeName || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Broadcasted Announcements</h2>
            <Button size="sm" variant="primary" onClick={handleOpenBroadcastNotif} icon={Bell}>
              Broadcast New Alert
            </Button>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {notif.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Delivered via Socket.IO
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BUS */}
      <Modal
        isOpen={busModalOpen}
        onClose={() => setBusModalOpen(false)}
        title={editingBus ? `Edit ${editingBus.busNumber}` : 'Add New College Bus'}
      >
        <form onSubmit={handleSaveBus} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bus Number</label>
              <input
                type="text"
                required
                value={busForm.busNumber}
                onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                placeholder="BUS-105"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Plate Number</label>
              <input
                type="text"
                required
                value={busForm.registrationNumber}
                onChange={(e) => setBusForm({ ...busForm, registrationNumber: e.target.value })}
                placeholder="KA-01-EQ-9999"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Driver Name</label>
              <input
                type="text"
                required
                value={busForm.driverName}
                onChange={(e) => setBusForm({ ...busForm, driverName: e.target.value })}
                placeholder="Driver Full Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Driver Phone</label>
              <input
                type="text"
                required
                value={busForm.driverPhone}
                onChange={(e) => setBusForm({ ...busForm, driverPhone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Route</label>
              <select
                value={busForm.routeId}
                onChange={(e) => setBusForm({ ...busForm, routeId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Select Route</option>
                {routes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.routeNumber} - {r.routeName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Status</label>
              <select
                value={busForm.status}
                onChange={(e) => setBusForm({ ...busForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="On Time">On Time</option>
                <option value="Delayed">Delayed</option>
                <option value="Arriving">Arriving</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setBusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Bus
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD / EDIT ROUTE */}
      <Modal
        isOpen={routeModalOpen}
        onClose={() => setRouteModalOpen(false)}
        title={editingRoute ? `Edit Route: ${editingRoute.routeNumber}` : 'Create Campus Route'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveRoute} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Route Number</label>
              <input
                type="text"
                required
                value={routeForm.routeNumber}
                onChange={(e) => setRouteForm({ ...routeForm, routeNumber: e.target.value })}
                placeholder="R-501"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Route Name</label>
              <input
                type="text"
                required
                value={routeForm.routeName}
                onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                placeholder="Route 501 - Airport Link"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Point</label>
              <input
                type="text"
                required
                value={routeForm.startPoint}
                onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                placeholder="Starting Depot"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination</label>
              <input
                type="text"
                required
                value={routeForm.destination}
                onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                placeholder="Apex University Main Campus"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (Min)</label>
              <input
                type="number"
                required
                value={routeForm.estimatedDuration}
                onChange={(e) => setRouteForm({ ...routeForm, estimatedDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setRouteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Route
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: BROADCAST NOTIFICATION */}
      <Modal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        title="Broadcast Instant Alert to Students"
      >
        <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notification Title</label>
            <input
              type="text"
              required
              value={notifForm.title}
              onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
              placeholder="e.g. Bus 101 Running 15 Mins Late"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alert Message</label>
            <textarea
              required
              rows={3}
              value={notifForm.message}
              onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
              placeholder="Provide context regarding road conditions or estimated delay..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notification Type</label>
              <select
                value={notifForm.type}
                onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="delay">Bus Delay Alert</option>
                <option value="arrival">Arriving Soon</option>
                <option value="route_change">Route Schedule Change</option>
                <option value="general">General Notice</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Associated Bus</label>
              <select
                value={notifForm.busId}
                onChange={(e) => setNotifForm({ ...notifForm, busId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">None / Campus-wide</option>
                {buses.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.busNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setNotifModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={Bell}>
              Send & Broadcast
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: QUICK UPDATE STATUS */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status: ${statusTargetBus?.busNumber}`}
      >
        <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Operating Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="On Time">On Time</option>
              <option value="Delayed">Delayed</option>
              <option value="Arriving">Arriving</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {newStatus === 'Delayed' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Delay Reason (Will automatically create student notification)
              </label>
              <input
                type="text"
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                placeholder="e.g. Heavy traffic along ring road"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Apply Status Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
