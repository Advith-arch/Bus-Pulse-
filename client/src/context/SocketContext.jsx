import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSocket } from '../services/socketService.js';
import { busService } from '../services/busService.js';
import { notificationService } from '../services/notificationService.js';
import { simulationService } from '../services/simulationService.js';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [buses, setBuses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [latestAlert, setLatestAlert] = useState(null);
  const [loadingBuses, setLoadingBuses] = useState(true);

  // Fetch initial buses and notifications
  const fetchInitialData = useCallback(async () => {
    try {
      const [busesData, notifsData, simStatus] = await Promise.all([
        busService.getAllBuses(),
        notificationService.getAllNotifications(),
        simulationService.getStatus(),
      ]);
      setBuses(busesData);
      setNotifications(notifsData);
      setIsSimulating(simStatus?.isSimulating || false);
    } catch (err) {
      console.warn('Initial data load error:', err.message);
    } finally {
      setLoadingBuses(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Connect to Socket.IO events
  useEffect(() => {
    const socket = getSocket();

    const handleLocationUpdate = (payload) => {
      setBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          if (bus._id === payload.busId) {
            return {
              ...bus,
              currentLocation: payload.currentLocation,
              speed: payload.speed,
              status: payload.status || bus.status,
              lastUpdated: payload.lastUpdated,
              eta: payload.eta || bus.eta,
            };
          }
          return bus;
        });
      });
    };

    const handleStatusUpdate = (payload) => {
      setBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          if (bus._id === payload.busId) {
            return {
              ...bus,
              status: payload.status,
            };
          }
          return bus;
        });
      });
    };

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setLatestAlert(notification);

      // Auto dismiss banner after 6s
      setTimeout(() => {
        setLatestAlert((curr) => (curr?._id === notification._id ? null : curr));
      }, 6000);
    };

    const handleSimulationState = (payload) => {
      setIsSimulating(payload.isSimulating);
    };

    socket.on('bus_location_update', handleLocationUpdate);
    socket.on('bus_status_update', handleStatusUpdate);
    socket.on('new_notification', handleNewNotification);
    socket.on('simulation_state_changed', handleSimulationState);

    return () => {
      socket.off('bus_location_update', handleLocationUpdate);
      socket.off('bus_status_update', handleStatusUpdate);
      socket.off('new_notification', handleNewNotification);
      socket.off('simulation_state_changed', handleSimulationState);
    };
  }, []);

  const toggleSimulation = async () => {
    try {
      if (isSimulating) {
        await simulationService.stop();
        setIsSimulating(false);
      } else {
        await simulationService.start();
        setIsSimulating(true);
      }
    } catch (err) {
      console.error('Failed to toggle simulation:', err.message);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const value = {
    buses,
    notifications,
    unreadCount,
    isSimulating,
    latestAlert,
    loadingBuses,
    refreshData: fetchInitialData,
    toggleSimulation,
    markNotificationRead,
    dismissAlert: () => setLatestAlert(null),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
