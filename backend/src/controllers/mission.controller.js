import { missionService } from '../services/mission.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAll = async (req, res, next) => {
  try {
    const missions = await missionService.getAllMissions();
    return sendSuccess(res, { missions });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mission = await missionService.getMissionById(id);
    return sendSuccess(res, { mission });
  } catch (error) {
    next(error);
  }
};

export const start = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await missionService.startMission(req.user._id, id);
    return sendSuccess(res, result, 'Mission initiated');
  } catch (error) {
    next(error);
  }
};

export const complete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tasks } = req.body;
    const result = await missionService.completeMission(req.user._id, id, tasks);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await missionService.getMissionProgress(req.user._id, id);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
