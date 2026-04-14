const { getAuth } = require('@clerk/express');
const User = require('../models/User');

// Reads the auth state set by clerkMiddleware() and rejects requests
// with no valid userId (missing/invalid/expired Clerk JWT).
const authenticateToken = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ error: 'Unauthorized: No valid Clerk token' });
  }
  req.auth = auth; // Attach so controllers can read req.auth.userId
  next();
};

// RBAC Middleware: Verifies the authenticated user has the 'Admin' role
const checkAdmin = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Unauthorized: Not authenticated' });
    }

    const user = await User.findOne({ user_id: req.auth.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const { clerkClient } = require('@clerk/express');
    const clerkUser = await clerkClient.users.getUser(req.auth.userId);
    const role = clerkUser.publicMetadata?.role;

    if (role !== 'Admin' && role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Attach user to request for convenience in controllers
    req.dbUser = user;
    next();
  } catch (error) {
    console.error('RBAC Error:', error);
    res.status(500).json({ error: 'Internal server error during authorization' });
  }
};

module.exports = { authenticateToken, checkAdmin };
