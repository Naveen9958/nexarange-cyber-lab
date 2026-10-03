import { Progress } from '../models/Progress.js';
import { User } from '../models/User.js';
import { MissionAttempt } from '../models/MissionAttempt.js';
import { calculateLevelInfo } from '../utils/constants.js';

export const progressService = {
  async getUserProgress(userId) {
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = await Progress.create({ userId });
    }
    const levelInfo = calculateLevelInfo(progress.totalXp);
    return {
      progress,
      levelInfo,
    };
  },

  async resetUserProgress(userId) {
    // Delete user mission attempts
    await MissionAttempt.deleteMany({ userId });

    // Reset progress document
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    progress.missionsCompleted = new Map();
    progress.labsCompleted = [];
    progress.totalXp = 0;
    progress.sessionXp = 0;
    progress.currentLevel = 3;
    progress.badges = [];
    progress.skillMatrix = {
      'AI Security': 0,
      'Cloud Infra': 0,
      'Forensics': 0,
      'Cryptography': 0,
      'Networking': 0,
      'Kubernetes': 0,
    };
    progress.xpHistory = [];
    progress.lastActivityAt = new Date();
    await progress.save();

    // Reset User total XP and level
    await User.findByIdAndUpdate(userId, {
      xp: 0,
      level: 3,
    });

    return {
      success: true,
      message: 'Simulation workspace restored to initial benchmark.',
    };
  },
};
