import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { sendError } from '../utils/apiResponse.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return sendError(
      res,
      errors.array()[0].msg || 'Validation failed for request parameters',
      'VALIDATION_ERROR',
      400,
      errorDetails
    );
  }
  next();
};

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
