import { sendError } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  return sendError(res, `API route ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND', 404);
};
