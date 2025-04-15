const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userUsage = require('../models/userUsage');

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

// Get usage statistics for all users
router.get('/', authenticateToken, (req, res) => {
  try {
    const usageData = userUsage.getAllUserUsage();
    res.status(200).json({
      count: usageData.length,
      usage: usageData
    });
  } catch (error) {
    console.error('Error fetching user usage:', error);
    res.status(500).json({ error: 'Server error while fetching user usage statistics' });
  }
});

// Get usage statistics for current user
router.get('/me', authenticateToken, (req, res) => {
  try {
    const usage = userUsage.getUserUsage(req.user.id);
    
    if (!usage) {
      return res.status(404).json({ error: 'Usage statistics not found for this user' });
    }
    
    res.status(200).json(usage);
  } catch (error) {
    console.error('Error fetching user usage:', error);
    res.status(500).json({ error: 'Server error while fetching usage statistics' });
  }
});

// Get usage statistics for a specific user (by ID)
router.get('/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const usage = userUsage.getUserUsage(userId);
    
    if (!usage) {
      return res.status(404).json({ error: 'User usage statistics not found' });
    }
    
    res.status(200).json(usage);
  } catch (error) {
    console.error('Error fetching user usage:', error);
    res.status(500).json({ error: 'Server error while fetching usage statistics' });
  }
});

module.exports = router;