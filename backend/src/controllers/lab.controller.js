import { Lab } from '../models/Lab.js';
import { Mission } from '../models/Mission.js';
import { MissionAttempt } from '../models/MissionAttempt.js';
import { Progress } from '../models/Progress.js';
import { certificateService } from '../services/certificate.service.js';
import { xpService } from '../services/xp.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAll = async (req, res, next) => {
  try {
    const labs = await Lab.find({ isActive: true }).sort({ labId: 1 });
    return sendSuccess(res, { labs });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lab = await Lab.findOne({
      $or: [{ labId: Number(id) || -1 }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      isActive: true,
    });
    if (!lab) {
      return sendError(res, 'Simulation lab not found', 'NOT_FOUND', 404);
    }
    const missions = await Mission.find({ labId: lab.labId, isActive: true }).sort({ num: 1 });
    return sendSuccess(res, { lab, missions });
  } catch (error) {
    next(error);
  }
};

export const start = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lab = await Lab.findOne({ labId: Number(id) || -1, isActive: true });
    if (!lab) {
      return sendError(res, 'Simulation lab not found', 'NOT_FOUND', 404);
    }
    return sendSuccess(res, { labId: lab.labId, status: 'in_progress' }, 'Lab scenario initiated');
  } catch (error) {
    next(error);
  }
};

export const complete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const labId = Number(id);
    const lab = await Lab.findOne({ labId, isActive: true });
    if (!lab) {
      return sendError(res, 'Simulation lab not found', 'NOT_FOUND', 404);
    }

    // Verify all missions in this lab are completed
    const completedAttempts = await MissionAttempt.countDocuments({
      userId: req.user._id,
      labId,
      status: 'completed',
    });

    if (completedAttempts < 5) {
      return sendError(
        res,
        `Cannot complete lab: Only ${completedAttempts}/5 mission objectives secured.`,
        'INCOMPLETE_OBJECTIVES',
        400
      );
    }

    // Check if lab was already completed by user to prevent duplicate XP
    const progress = await Progress.findOne({ userId: req.user._id });
    if (progress && progress.labsCompleted.includes(labId)) {
      return sendSuccess(
        res,
        { labId, alreadyCompleted: true, totalXp: progress.totalXp },
        'Lab scenario was already completed.'
      );
    }

    // Mark lab completed
    if (progress) {
      progress.labsCompleted.push(labId);
      await progress.save();
    }

    // Issue certificate
    const cert = await certificateService.checkAndIssueCertificate(req.user._id, labId);

    return sendSuccess(
      res,
      {
        labId,
        completed: true,
        certificate: cert,
      },
      'Operation scenario fully resolved and debriefed.'
    );
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const labId = Number(id);
    const attempts = await MissionAttempt.find({ userId: req.user._id, labId });
    const progress = await Progress.findOne({ userId: req.user._id });

    return sendSuccess(res, {
      labId,
      completedMissionsCount: attempts.filter((a) => a.status === 'completed').length,
      isLabCompleted: progress ? progress.labsCompleted.includes(labId) : false,
      attempts,
    });
  } catch (error) {
    next(error);
  }
};
