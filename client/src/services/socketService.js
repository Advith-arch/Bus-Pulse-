import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const host = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';
    const socketUrl = import.meta.env.VITE_SOCKET_URL || `http://${host}:5001`;
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log(`[Socket] Connected to live bus feed: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected from live bus feed: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.warn(`[Socket] Connection error: ${error.message}`);
    });
  }
  return socket;
};
