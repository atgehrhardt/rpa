const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const taskManager = require('./utils/taskManager');
const taskRoutes = require('./api/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes'); // Correct import of settings routes

dotenv.config();

const app = express();

// Correct setting of app.locals
app.locals.currentApiKey = '123'; // Store initial API key
app.locals.apiKeyEnabled = true; // Initial API access state

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "*", // Consider tuning this setting for production
  exposedHeaders: ['Content-Disposition', 'X-Filename']
}));

app.use(express.json());

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes); // Add settings routes

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

module.exports = { app, server, io };