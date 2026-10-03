import { rankService } from '../services/rank.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getMe = async (req, res, next) => {
  try {
    const rankInfo = await rankService.getUserRank(req.user._id);
    return sendSuccess(res, rankInfo);
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await rankService.getLeaderboard(req.user._id);
    return sendSuccess(res, { leaderboard });
  } catch (error) {
    next(error);
  }
};
