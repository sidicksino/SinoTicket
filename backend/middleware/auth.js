const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// This middleware automatically validates the Clerk JWT passed in the Authorization header.
// It will attach the payload to req.auth (e.g. req.auth.userId)
// If the token is invalid or missing, it returns a 401 Unauthorized response.
const authenticateToken = (req, res, next) => {
  return ClerkExpressRequireAuth({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  })(req, res, next);
};

module.exports = authenticateToken;
