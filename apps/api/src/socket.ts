import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // Allow client to join a specific conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized yet!');
    return null;
  }
  return io;
};
