const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Chat-Net API is running');
});

// Active users tracking
const activeUsers = new Map();

// Helper function to get aggregated active users list
const getAggregatedActiveUsers = () => {
  const userMap = {};
  
  // First pass: collect all socketIds for each user, using nickname as the key identifier
  activeUsers.forEach(user => {
    // Use nickname as the unique identifier to consolidate same user
    const userIdentifier = user.nickname;
    
    if (!userMap[userIdentifier]) {
      userMap[userIdentifier] = {
        userId: user.userId,
        nickname: user.nickname,
        socketIds: [],
        connectionCount: 0
      };
    }
    userMap[userIdentifier].socketIds.push(user.socketId);
  });
  
  // Second pass: set connection count and pick first socketId for reference
  Object.values(userMap).forEach(user => {
    user.connectionCount = user.socketIds.length;
    user.socketId = user.socketIds[0]; // Use first socketId for consistency
    delete user.socketIds; // Remove socketIds array as it's not needed by clients
  });
  
  return Object.values(userMap);
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // User joins with their user info
  socket.on('user_connected', (userData) => {
    // Store user information with socket ID
    activeUsers.set(socket.id, {
      userId: userData.userId,
      nickname: userData.nickname,
      socketId: socket.id // Keep socketId for disconnection logic
    });
    
    // Broadcast updated aggregated user list to all clients
    io.emit('active_users', getAggregatedActiveUsers());
    console.log(`User ${userData.nickname} (${userData.userId}) connected. Total connections for user: ${getAggregatedActiveUsers().find(u => u.nickname === userData.nickname)?.connectionCount}`);
  });

  // Handle incoming messages
  socket.on('send_message', (messageData) => {
    console.log('New message:', messageData);
    
    // Broadcast the message to all clients
    io.emit('new_message', {
      ...messageData,
      timestamp: new Date().toISOString()
    });
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    // Broadcast typing indicator to all except sender
    socket.broadcast.emit('user_typing', {
      userId: data.userId,
      nickname: data.nickname,
      isTyping: data.isTyping
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (activeUsers.has(socket.id)) {
      const userData = activeUsers.get(socket.id);
      console.log(`User ${userData.nickname} (${userData.userId}) disconnected socket ${socket.id}`);
      activeUsers.delete(socket.id);
      // Broadcast updated aggregated user list
      io.emit('active_users', getAggregatedActiveUsers());
    }
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});