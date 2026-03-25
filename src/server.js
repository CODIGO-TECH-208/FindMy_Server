// src/server.js
import express from  'express'
import connectDB from './config/db.js';
import dotenv  from 'dotenv';
dotenv.config()
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'FindMy API is running!' });
});

// Import Routes
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});