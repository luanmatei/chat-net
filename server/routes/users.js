const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token (copied from auth.js for consistency)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'chat_net_secret_key');
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get a list of all active users (from the activeUsers in index.js)
// This is a sample implementation - you'll need to integrate with your user storage
router.get('/', authenticateToken, (req, res) => {
  try {
    // For now, let's send a test response to verify the API works
    // In a real implementation, you would fetch users from your database
    const users = [
      { id: '1', nickname: 'User 1', email: 'user1@example.com', role: 'user' },
      { id: '2', nickname: 'User 2', email: 'user2@example.com', role: 'admin' },
      { id: '3', nickname: 'User 3', email: 'user3@example.com', role: 'user' }
    ];
    
    res.status(200).json({
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

// Get a specific user by ID
router.get('/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    
    // For testing purposes only
    const user = { 
      id: userId, 
      nickname: `User ${userId}`, 
      email: `user${userId}@example.com`,
      role: parseInt(userId) === 2 ? 'admin' : 'user'
    };
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error while fetching user' });
  }
});

module.exports = router;