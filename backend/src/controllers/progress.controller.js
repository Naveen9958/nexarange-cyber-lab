import { progressService } from '../services/progress.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getProgress = async (req, res, next) => {
  try {
    const result = await progressService.getUserProgress(req.user._id);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const resetProgress = async (req, res, next) => {
  try {
    const result = await progressService.resetUserProgress(req.user._id);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
