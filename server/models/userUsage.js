// User usage tracking system
// Stores metrics about user activity

// In-memory storage for user usage statistics
const userUsageStore = new Map();

/**
 * Initialize a new user's usage tracking
 * @param {string} userId - Unique identifier for the user
 * @param {string} nickname - User's nickname
 */
const initializeUserUsage = (userId, nickname) => {
  if (!userUsageStore.has(userId)) {
    userUsageStore.set(userId, {
      userId,
      nickname,
      messagesSent: 0,
      loginCount: 0,
      lastActive: new Date().toISOString(),
      totalTimeOnline: 0, // in seconds
      lastLoginTime: new Date().toISOString(),
      connectionHistory: []
    });
  }
};

/**
 * Record user login activity
 * @param {string} userId - The user's ID
 */
const recordLogin = (userId) => {
  const userUsage = userUsageStore.get(userId);
  if (userUsage) {
    userUsage.loginCount++;
    userUsage.lastLoginTime = new Date().toISOString();
    userUsage.connectionHistory.push({
      event: 'login',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Record user logout or disconnection
 * @param {string} userId - The user's ID
 */
const recordLogout = (userId) => {
  const userUsage = userUsageStore.get(userId);
  if (userUsage) {
    // Calculate time spent online since last login
    const lastLogin = new Date(userUsage.lastLoginTime);
    const now = new Date();
    const timeSpentSeconds = Math.floor((now - lastLogin) / 1000);
    
    userUsage.totalTimeOnline += timeSpentSeconds;
    userUsage.lastActive = now.toISOString();
    userUsage.connectionHistory.push({
      event: 'logout',
      timestamp: now.toISOString(),
      sessionDuration: timeSpentSeconds
    });
  }
};

/**
 * Record message sent by user
 * @param {string} userId - The user's ID
 */
const recordMessageSent = (userId) => {
  const userUsage = userUsageStore.get(userId);
  if (userUsage) {
    userUsage.messagesSent++;
    userUsage.lastActive = new Date().toISOString();
  }
};

/**
 * Get all user usage statistics
 * @returns {Array} Array of user usage objects
 */
const getAllUserUsage = () => {
  return Array.from(userUsageStore.values());
};

/**
 * Get usage statistics for a specific user
 * @param {string} userId - The user's ID
 * @returns {Object|null} User usage object or null if not found
 */
const getUserUsage = (userId) => {
  return userUsageStore.get(userId) || null;
};

module.exports = {
  initializeUserUsage,
  recordLogin,
  recordLogout,
  recordMessageSent,
  getAllUserUsage,
  getUserUsage
};