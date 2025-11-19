import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

// Initialize Socket.io
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:8080',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRoles = decoded.roles || [];
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join role-based rooms
    socket.userRoles.forEach(role => {
      socket.join(`role:${role}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });

    // Handle custom events
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room: ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room: ${roomId}`);
    });
  });

  console.log('Socket.io initialized');
  return io;
};

// Get Socket.io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit notification to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit to all users with specific role
export const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

// Emit to specific room
export const emitToRoom = (roomId, event, data) => {
  if (io) {
    io.to(roomId).emit(event, data);
  }
};

// Broadcast to all connected users
export const broadcastToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export default { initializeSocket, getIO, emitToUser, emitToRole, emitToRoom, broadcastToAll };
