const { notificationService } = require('../services/notificationService');

// Error types that should trigger notifications
const CRITICAL_ERROR_TYPES = [
  'DatabaseConnectionError',
  'PaymentProcessingError',
  'InventoryError',
  'SystemError',
  'SecurityError'
];

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  // Payment errors
  if (err.type === 'StripeCardError') {
    message = err.message;
    statusCode = 400;
  }

  if (err.type === 'StripeInvalidRequestError') {
    message = 'Invalid payment request';
    statusCode = 400;
  }

  // Check if this is a critical error that needs notification
  const isCriticalError = CRITICAL_ERROR_TYPES.includes(err.name) || 
                         statusCode >= 500 || 
                         err.critical === true;

  if (isCriticalError) {
    // Send notification for critical errors
    notificationService.sendSystemError(err.name || 'Unknown Error', err)
      .catch(notificationError => {
        console.error('Failed to send error notification:', notificationError);
      });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, critical = false) {
    super(message);
    this.statusCode = statusCode;
    this.critical = critical;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
class DatabaseError extends AppError {
  constructor(message) {
    super(message, 500, true);
    this.name = 'DatabaseConnectionError';
  }
}

class PaymentError extends AppError {
  constructor(message) {
    super(message, 400, true);
    this.name = 'PaymentProcessingError';
  }
}

class InventoryError extends AppError {
  constructor(message) {
    super(message, 400, true);
    this.name = 'InventoryError';
  }
}

class SecurityError extends AppError {
  constructor(message) {
    super(message, 403, true);
    this.name = 'SecurityError';
  }
}

// Unhandled promise rejection handler
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  
  // Send notification for unhandled rejections
  notificationService.sendSystemError('Unhandled Promise Rejection', err)
    .catch(notificationError => {
      console.error('Failed to send unhandled rejection notification:', notificationError);
    });

  // Close server & exit process
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  
  // Send notification for uncaught exceptions
  notificationService.sendSystemError('Uncaught Exception', err)
    .catch(notificationError => {
      console.error('Failed to send uncaught exception notification:', notificationError);
    });

  // Exit process
  process.exit(1);
});

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  DatabaseError,
  PaymentError,
  InventoryError,
  SecurityError
};
