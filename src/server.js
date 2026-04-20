// src/server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

connectDB();

const app = express();

// Initialize HTTP Server and Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('User connected with socket:', socket.id);

  // Join a specific chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined room ${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware to expose io to controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware to parse JSON
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'FindMy API & Socket is running!' });
});

// Import Routes
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import claimRoutes from './routes/claim.js';
import chatRoutes from './routes/chat.js';
import userRoutes from './routes/user.js';

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/user', userRoutes);

// Start server
const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});