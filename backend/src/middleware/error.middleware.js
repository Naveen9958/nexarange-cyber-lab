import { logger } from '../utils/logger.js';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errorCode = err.code || 'SERVER_ERROR';
  let details = null;

  // Log error safely without leaking sensitive payload
  logger.error('Unhandled request error', {
    method: req.method,
    url: req.originalUrl,
    error: err.name || 'Error',
    message: err.message,
  });

  // Handle Mongoose / MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    if (field === 'username') {
      message = 'Username already exists. Please choose another username.';
    } else if (field === 'email') {
      message = 'An account with this email already exists.';
    } else {
      message = `An entry with this ${field} already exists.`;
    }
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    message = messages.join(', ') || 'Schema validation failed';
    details = messages;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_IDENTIFIER';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Authentication token is invalid';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // Ensure production never exposes stack traces or internal filesystem paths
  return sendError(res, message, errorCode, statusCode, details);
};
