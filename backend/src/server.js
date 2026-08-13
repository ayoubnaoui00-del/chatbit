import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { socketAuthMiddleware } from './sockets/socket.middleware.js';
import { registerChatSocket } from './sockets/chat.socket.js';

const PORT = process.env.PORT || 5000;

export const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.set('io', io);

io.use(socketAuthMiddleware);

registerChatSocket(io);

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` ChatBit Backend Server running on port ${PORT}`);
  console.log(` REST API: http://localhost:${PORT}/api`);
  console.log(` Scalar Docs: http://localhost:${PORT}/docs`);
  console.log(` WebSocket: ws://localhost:${PORT}`);
  console.log(`====================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
