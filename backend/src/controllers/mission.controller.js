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
    const { tasks, flag, answer } = req.body;
    const result = await missionService.completeMission(req.user._id, id, tasks, flag || answer);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const verifyFlag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { flag, answer } = req.body;
    const result = await missionService.verifyFlag(id, flag || answer);
    return sendSuccess(res, result, result.isValid ? 'Flag verified successfully' : 'Flag verification failed');
  } catch (error) {
    next(error);
  }
};

export const executeAlgorithm = async (req, res, next) => {
  try {
    const { type } = req.params;
    const result = await missionService.executeAlgorithm(type, req.body);
    return sendSuccess(res, result, 'Algorithm execution telemetry processed');
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
