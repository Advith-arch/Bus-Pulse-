import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getDbStatus } from '../config/db.js';
import User from '../models/User.js';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';
import Notification from '../models/Notification.js';
import { seedRoutes, seedBuses, seedUsers, seedNotifications } from '../utils/seedData.js';

// In-memory collections initialized with cloned seed data
let memoryRoutes = JSON.parse(JSON.stringify(seedRoutes));
let memoryBuses = JSON.parse(JSON.stringify(seedBuses));
let memoryNotifications = JSON.parse(JSON.stringify(seedNotifications));
let memoryUsers = [];

// Initialize memory users with hashed passwords
export const initMemoryStore = async () => {
  memoryUsers = await Promise.all(
    seedUsers.map(async (u) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      return {
        ...u,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    })
  );
  console.log(`[DataStore] In-memory store ready: ${memoryUsers.length} users, ${memoryBuses.length} buses, ${memoryRoutes.length} routes, ${memoryNotifications.length} notifications.`);
};

// Helper to generate mongo-compatible string id
const generateId = () => new mongoose.Types.ObjectId().toString();

export const dataStore = {
  // USER OPERATIONS
  user: {
    async find(filter = {}) {
      if (getDbStatus()) {
        return await User.find(filter).populate('preferredRoute').lean();
      }
      return memoryUsers.filter((u) => {
        if (filter.role && u.role !== filter.role) return false;
        return true;
      }).map(u => {
        const { password, ...safe } = u;
        const route = memoryRoutes.find(r => r._id === u.preferredRoute);
        return { ...safe, preferredRoute: route || u.preferredRoute };
      });
    },

    async findById(id) {
      if (getDbStatus()) {
        return await User.findById(id).populate('preferredRoute');
      }
      const user = memoryUsers.find((u) => u._id === id);
      if (!user) return null;
      const route = memoryRoutes.find(r => r._id === user.preferredRoute);
      return { ...user, preferredRoute: route || user.preferredRoute };
    },

    async findOne(filter = {}, includePassword = false) {
      if (getDbStatus()) {
        let q = User.findOne(filter).populate('preferredRoute');
        if (includePassword) q = q.select('+password');
        return await q;
      }
      const user = memoryUsers.find((u) => {
        if (filter.email && u.email.toLowerCase() !== filter.email.toLowerCase()) return false;
        if (filter._id && u._id !== filter._id) return false;
        return true;
      });
      if (!user) return null;
      const copy = { ...user };
      if (!includePassword) delete copy.password;
      const route = memoryRoutes.find(r => r._id === copy.preferredRoute);
      copy.preferredRoute = route || copy.preferredRoute;
      return copy;
    },

    async create(userData) {
      if (getDbStatus()) {
        const user = await User.create(userData);
        return await User.findById(user._id).populate('preferredRoute');
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const newUser = {
        _id: generateId(),
        ...userData,
        password: hashedPassword,
        role: userData.role || 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryUsers.push(newUser);
      const safe = { ...newUser };
      delete safe.password;
      const route = memoryRoutes.find(r => r._id === safe.preferredRoute);
      safe.preferredRoute = route || safe.preferredRoute;
      return safe;
    },

    async countDocuments(filter = {}) {
      if (getDbStatus()) {
        return await User.countDocuments(filter);
      }
      return memoryUsers.filter((u) => {
        if (filter.role && u.role !== filter.role) return false;
        return true;
      }).length;
    },

    async comparePassword(enteredPassword, hashedPassword) {
      return await bcrypt.compare(enteredPassword, hashedPassword);
    }
  },

  // ROUTE OPERATIONS
  route: {
    async find(filter = {}) {
      if (getDbStatus()) {
        return await Route.find(filter).lean();
      }
      return [...memoryRoutes];
    },

    async findById(id) {
      if (getDbStatus()) {
        return await Route.findById(id);
      }
      return memoryRoutes.find((r) => r._id === id) || null;
    },

    async create(routeData) {
      if (getDbStatus()) {
        return await Route.create(routeData);
      }
      const newRoute = {
        _id: generateId(),
        ...routeData,
        stops: routeData.stops || [],
        coordinates: routeData.coordinates || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryRoutes.push(newRoute);
      return newRoute;
    },

    async findByIdAndUpdate(id, updateData) {
      if (getDbStatus()) {
        return await Route.findByIdAndUpdate(id, updateData, { new: true });
      }
      const idx = memoryRoutes.findIndex((r) => r._id === id);
      if (idx === -1) return null;
      memoryRoutes[idx] = {
        ...memoryRoutes[idx],
        ...updateData,
        updatedAt: new Date(),
      };
      return memoryRoutes[idx];
    },

    async findByIdAndDelete(id) {
      if (getDbStatus()) {
        return await Route.findByIdAndDelete(id);
      }
      const idx = memoryRoutes.findIndex((r) => r._id === id);
      if (idx === -1) return null;
      const deleted = memoryRoutes.splice(idx, 1)[0];
      return deleted;
    },

    async countDocuments(filter = {}) {
      if (getDbStatus()) {
        return await Route.countDocuments(filter);
      }
      return memoryRoutes.length;
    }
  },

  // BUS OPERATIONS
  bus: {
    async find(filter = {}) {
      if (getDbStatus()) {
        return await Bus.find(filter).populate('routeId').lean();
      }
      return memoryBuses.map((b) => {
        const route = memoryRoutes.find((r) => r._id === (b.routeId?._id || b.routeId));
        return {
          ...b,
          routeId: route || b.routeId,
        };
      });
    },

    async findById(id) {
      if (getDbStatus()) {
        return await Bus.findById(id).populate('routeId');
      }
      const bus = memoryBuses.find((b) => b._id === id);
      if (!bus) return null;
      const route = memoryRoutes.find((r) => r._id === (bus.routeId?._id || bus.routeId));
      return {
        ...bus,
        routeId: route || bus.routeId,
      };
    },

    async create(busData) {
      if (getDbStatus()) {
        const b = await Bus.create(busData);
        return await Bus.findById(b._id).populate('routeId');
      }
      const newBus = {
        _id: generateId(),
        ...busData,
        status: busData.status || 'On Time',
        speed: busData.speed || 35,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryBuses.push(newBus);
      const route = memoryRoutes.find((r) => r._id === (newBus.routeId?._id || newBus.routeId));
      return {
        ...newBus,
        routeId: route || newBus.routeId,
      };
    },

    async findByIdAndUpdate(id, updateData) {
      if (getDbStatus()) {
        return await Bus.findByIdAndUpdate(id, updateData, { new: true }).populate('routeId');
      }
      const idx = memoryBuses.findIndex((b) => b._id === id);
      if (idx === -1) return null;
      memoryBuses[idx] = {
        ...memoryBuses[idx],
        ...updateData,
        lastUpdated: new Date(),
        updatedAt: new Date(),
      };
      const bus = memoryBuses[idx];
      const route = memoryRoutes.find((r) => r._id === (bus.routeId?._id || bus.routeId));
      return {
        ...bus,
        routeId: route || bus.routeId,
      };
    },

    async findByIdAndDelete(id) {
      if (getDbStatus()) {
        return await Bus.findByIdAndDelete(id);
      }
      const idx = memoryBuses.findIndex((b) => b._id === id);
      if (idx === -1) return null;
      const deleted = memoryBuses.splice(idx, 1)[0];
      return deleted;
    },

    async countDocuments(filter = {}) {
      if (getDbStatus()) {
        return await Bus.countDocuments(filter);
      }
      return memoryBuses.filter((b) => {
        if (filter.status && b.status !== filter.status) return false;
        return true;
      }).length;
    }
  },

  // NOTIFICATION OPERATIONS
  notification: {
    async find(filter = {}) {
      if (getDbStatus()) {
        return await Notification.find(filter)
          .sort({ createdAt: -1 })
          .populate('busId routeId')
          .lean();
      }
      const sorted = [...memoryNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return sorted.map((n) => {
        const bus = memoryBuses.find((b) => b._id === (n.busId?._id || n.busId));
        const route = memoryRoutes.find((r) => r._id === (n.routeId?._id || n.routeId));
        return {
          ...n,
          busId: bus || n.busId,
          routeId: route || n.routeId,
        };
      });
    },

    async findById(id) {
      if (getDbStatus()) {
        return await Notification.findById(id).populate('busId routeId');
      }
      const n = memoryNotifications.find((item) => item._id === id);
      if (!n) return null;
      const bus = memoryBuses.find((b) => b._id === (n.busId?._id || n.busId));
      const route = memoryRoutes.find((r) => r._id === (n.routeId?._id || n.routeId));
      return {
        ...n,
        busId: bus || n.busId,
        routeId: route || n.routeId,
      };
    },

    async create(notifData) {
      if (getDbStatus()) {
        const n = await Notification.create(notifData);
        return await Notification.findById(n._id).populate('busId routeId');
      }
      const newNotif = {
        _id: generateId(),
        ...notifData,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryNotifications.unshift(newNotif);
      const bus = memoryBuses.find((b) => b._id === (newNotif.busId?._id || newNotif.busId));
      const route = memoryRoutes.find((r) => r._id === (newNotif.routeId?._id || newNotif.routeId));
      return {
        ...newNotif,
        busId: bus || newNotif.busId,
        routeId: route || newNotif.routeId,
      };
    },

    async findByIdAndUpdate(id, updateData) {
      if (getDbStatus()) {
        return await Notification.findByIdAndUpdate(id, updateData, { new: true }).populate('busId routeId');
      }
      const idx = memoryNotifications.findIndex((n) => n._id === id);
      if (idx === -1) return null;
      memoryNotifications[idx] = {
        ...memoryNotifications[idx],
        ...updateData,
        updatedAt: new Date(),
      };
      const n = memoryNotifications[idx];
      const bus = memoryBuses.find((b) => b._id === (n.busId?._id || n.busId));
      const route = memoryRoutes.find((r) => r._id === (n.routeId?._id || n.routeId));
      return {
        ...n,
        busId: bus || n.busId,
        routeId: route || n.routeId,
      };
    },

    async countDocuments(filter = {}) {
      if (getDbStatus()) {
        return await Notification.countDocuments(filter);
      }
      return memoryNotifications.filter((n) => {
        if (filter.isRead !== undefined && n.isRead !== filter.isRead) return false;
        return true;
      }).length;
    }
  }
};
