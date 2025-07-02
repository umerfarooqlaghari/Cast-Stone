const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Check if MongoDB is available
const isMongoAvailable = () => {
  try {
    return Admin.db && Admin.db.readyState === 1;
  } catch (error) {
    return false;
  }
};

// Protect admin routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in. Please log in to access this resource.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if MongoDB is available
    if (!isMongoAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.'
      });
    }

    // Check if admin still exists and is active
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'The admin belonging to this token no longer exists or is inactive.'
      });
    }

    // Check if admin is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked.'
      });
    }

    // Check if password was changed after token was issued
    if (admin.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password was changed recently. Please log in again.'
      });
    }

    // Grant access to protected route
    req.admin = admin;
    next();

  } catch (error) {
    console.error('Admin auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your token has expired. Please log in again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error verifying authentication.'
    });
  }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

// Check specific permission
exports.checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.admin.hasPermission(resource, action)) {
      return res.status(403).json({
        success: false,
        message: `You do not have permission to ${action} ${resource}.`
      });
    }
    next();
  };
};

// Force password change check
exports.checkPasswordChange = (req, res, next) => {
  if (req.admin.mustChangePassword && req.path !== '/change-password') {
    return res.status(403).json({
      success: false,
      message: 'You must change your password before accessing other resources.',
      mustChangePassword: true
    });
  }
  next();
};

// Log admin activity
exports.logActivity = (action) => {
  return (req, res, next) => {
    // Store activity info for logging after response
    req.adminActivity = {
      adminId: req.admin ? req.admin._id : 'unauthenticated',
      adminEmail: req.admin ? req.admin.email : 'unauthenticated',
      action,
      resource: req.originalUrl,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };

    // Log the activity after response is sent
    const originalSend = res.send;
    res.send = function(data) {
      // Log the activity
      console.log('Admin Activity:', {
        ...req.adminActivity,
        statusCode: res.statusCode,
        success: res.statusCode < 400
      });

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

// Rate limiting for admin actions
const adminActionLimits = new Map();

exports.rateLimit = (maxAttempts = 10, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = `${req.admin._id}:${req.originalUrl}`;
    const now = Date.now();
    
    if (!adminActionLimits.has(key)) {
      adminActionLimits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const limit = adminActionLimits.get(key);
    
    if (now > limit.resetTime) {
      // Reset the limit
      adminActionLimits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (limit.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((limit.resetTime - now) / 1000)
      });
    }

    limit.count++;
    next();
  };
};

// Validate admin session
exports.validateSession = async (req, res, next) => {
  try {
    // Check if MongoDB is available
    if (!isMongoAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.'
      });
    }

    // Update last activity
    await Admin.findByIdAndUpdate(req.admin._id, {
      lastActivity: new Date()
    });

    next();
  } catch (error) {
    console.error('Session validation error:', error);
    next(); // Continue even if session update fails
  }
};
