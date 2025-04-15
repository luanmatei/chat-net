const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// In-memory messages storage (would be replaced with Firebase in production)
let messages = [];

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

// Send a new message
router.post('/messages', authenticateToken, (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: req.user.id,
      senderNickname: req.user.nickname,
      content,
      timestamp: new Date().toISOString()
    };
    
    // Save message to in-memory storage
    messages.push(newMessage);
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error while sending message' });
  }
});

// Get chat history (recent messages)
router.get('/messages', authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    // Get most recent messages up to the limit
    const recentMessages = messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .reverse(); // Return in chronological order
    
    res.status(200).json({
      count: recentMessages.length,
      messages: recentMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error while fetching messages' });
  }
});

// Delete a message (only the sender can delete their own message)
router.delete('/messages/:messageId', authenticateToken, (req, res) => {
  try {
    const { messageId } = req.params;
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if the user is the message sender
    if (messages[messageIndex].senderId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }
    
    // Remove the message
    const deletedMessage = messages.splice(messageIndex, 1)[0];
    
    res.status(200).json({
      message: 'Message deleted successfully',
      data: deletedMessage
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error while deleting message' });
  }
});

module.exports = router;