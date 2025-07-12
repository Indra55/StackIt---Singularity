const { verifyToken, getUserById } = require('../config/jwtConfig');

// Middleware to verify JWT token and attach user to request
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      message: 'Access token required',
      status: 'error'
    });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({
        message: 'Invalid or expired token',
        status: 'error'
      });
    }

    const user = await getUserById(decoded.id);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid or expired token',
      status: 'error'
    });
  }
};

// Middleware to check if user is authenticated (for protected routes)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
      status: 'error'
    });
  }
  next();
};

// Middleware to check if user is NOT authenticated (for login/register pages)
const checkNotAuthenticated = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      return res.status(400).json({
        message: 'Already authenticated',
        status: 'error'
      });
    }
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAuth,
  checkNotAuthenticated
};