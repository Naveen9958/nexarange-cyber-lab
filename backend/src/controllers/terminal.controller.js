import { terminalService } from '../services/terminal.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createSession = async (req, res, next) => {
  try {
    const { labId } = req.body;
    const session = await terminalService.createSession(req.user._id, labId ? Number(labId) : 1);
    return sendSuccess(res, { session }, 'Terminal session established', 201);
  } catch (error) {
    next(error);
  }
};

export const executeCommand = async (req, res, next) => {
  try {
    const { sessionId, command } = req.body;

    if (!sessionId || typeof command !== 'string') {
      return sendError(res, 'Valid sessionId and command string are required', 'INVALID_INPUT', 400);
    }

    const operatorMeta = {
      name: req.user.name,
      callsign: req.user.callsign,
      role: req.user.role,
    };

    const result = await terminalService.executeCommand(
      req.user._id,
      sessionId,
      command,
      operatorMeta
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await terminalService.getSession(req.user._id, id);
    return sendSuccess(res, { session });
  } catch (error) {
    next(error);
  }
};

export const closeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await terminalService.closeSession(req.user._id, id);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
