const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// In-memory user database (would be replaced with Firebase in production)
let users = [];

// Middleware to verify JWT token
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

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { nickname, contactNumber, password } = req.body;
    
    // Validate input
    if (!nickname || !contactNumber || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const userExists = users.find(user => 
      user.contactNumber === contactNumber ||
      user.nickname === nickname
    );
    
    if (userExists) {
      return res.status(409).json({ error: 'User with this nickname or contact number already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const userId = Date.now().toString();
    const newUser = {
      id: userId,
      nickname,
      contactNumber,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    // Save user (in memory for now)
    users.push(newUser);
    
    // Create and sign JWT token
    const token = jwt.sign(
      { id: userId, nickname, contactNumber },
      process.env.JWT_SECRET || 'chat_net_secret_key',
      { expiresIn: '7d' }
    );
    
    // Return user info (without password) and token
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        nickname,
        contactNumber,
        createdAt: newUser.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { contactNumber, password } = req.body;
    
    // Validate input
    if (!contactNumber || !password) {
      return res.status(400).json({ error: 'Contact number and password are required' });
    }
    
    // Find user
    const user = users.find(user => user.contactNumber === contactNumber);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Create and sign JWT token
    const token = jwt.sign(
      { id: user.id, nickname: user.nickname, contactNumber: user.contactNumber },
      process.env.JWT_SECRET || 'chat_net_secret_key',
      { expiresIn: '7d' }
    );
    
    // Return user info and token
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        nickname: user.nickname,
        contactNumber: user.contactNumber,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(user => user.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      id: user.id,
      nickname: user.nickname,
      contactNumber: user.contactNumber,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// Get all users (admin route)
router.get('/users', authenticateToken, (req, res) => {
  try {
    // Return users without passwords
    const safeUsers = users.map(user => ({
      id: user.id,
      nickname: user.nickname,
      contactNumber: user.contactNumber,
      createdAt: user.createdAt
    }));
    
    res.status(200).json({
      count: safeUsers.length,
      users: safeUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

module.exports = router;