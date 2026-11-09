import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

import { connectDB, getDbStatus } from './config/db.js';
import { initMemoryStore } from './services/dataStore.js';
import { initSocket } from './sockets/busSocket.js';
import { startSimulation } from './services/simulationService.js';

import authRoutes from './routes/authRoutes.js';
import busRoutes from './routes/busRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

initSocket(io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    name: 'BusPulse – College Bus Tracking API',
    databaseConnected: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/simulation', simulationRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Startup Server
const startServer = async () => {
  // Always initialize in-memory seed store first for instant readiness
  await initMemoryStore();

  // Attempt real MongoDB connection
  await connectDB();

  // Start HTTP and WebSocket listener
  server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  BusPulse Server running on http://localhost:${PORT}`);
    console.log(`  WebSocket live tracking enabled on port ${PORT}`);
    console.log(`  Admin Demo: admin@buspulse.edu / Admin@123`);
    console.log(`  Student Demo: student@buspulse.edu / Student@123`);
    console.log(`==================================================`);

    // Auto-start demo movement simulation so maps show active buses immediately
    startSimulation();
  });
};

startServer();

export { app, server, io };
