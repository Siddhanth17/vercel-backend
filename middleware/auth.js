const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ApiResponse = require('../utils/response');
const { User } = require('../models');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from Bearer token
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (if using cookie-based auth)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return ApiResponse.unauthorized(res, 'Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return ApiResponse.unauthorized(res, 'User not found');
    }

    if (!user.isActive) {
      return ApiResponse.unauthorized(res, 'User account is deactivated');
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expired, please login again');
    } else if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token');
    } else {
      return ApiResponse.unauthorized(res, 'Not authorized to access this route');
    }
  }
});

// Grant access to specific roles (if needed in future)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.forbidden(res, 'User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, `User role ${req.user.role} is not authorized to access this route`);
    }
    
    next();
  };
};

// Optional auth - doesn't fail if no token, but adds user if token exists
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
});

// Check if user owns the resource
const checkOwnership = (resourceUserField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    // Get the resource ID from params or body
    const resourceId = req.params.id || req.body.id;
    
    if (!resourceId) {
      return ApiResponse.error(res, 'Resource ID not provided', 400);
    }

    // This middleware assumes the resource has been loaded into req.resource
    // by a previous middleware or route handler
    if (req.resource && req.resource[resourceUserField]) {
      if (req.resource[resourceUserField].toString() !== req.user._id.toString()) {
        return ApiResponse.forbidden(res, 'Not authorized to access this resource');
      }
    }

    next();
  });
};

// Rate limiting for authentication endpoints
const authRateLimit = asyncHandler(async (req, res, next) => {
  // This could be enhanced with Redis for distributed rate limiting
  // For now, relying on the global rate limiter
  next();
});

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
  authRateLimit
};