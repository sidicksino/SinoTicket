const { getAuth } = require('@clerk/express');

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

module.exports = authenticateToken;
