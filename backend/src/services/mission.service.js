import { Mission } from '../models/Mission.js';
import { MissionAttempt } from '../models/MissionAttempt.js';
import { Progress } from '../models/Progress.js';
import { xpService } from './xp.service.js';
import { certificateService } from './certificate.service.js';
import { SKILL_CATEGORIES } from '../utils/constants.js';

export const missionService = {
  async getAllMissions() {
    return Mission.find({ isActive: true }).sort({ labId: 1, num: 1 });
  },

  async getMissionById(missionId) {
    const mission = await Mission.findOne({
      $or: [{ missionId }, { _id: missionId.match(/^[0-9a-fA-F]{24}$/) ? missionId : null }],
      isActive: true,
    });
    if (!mission) {
      const err = new Error('Operational mission not found or inactive.');
      err.statusCode = 404;
      throw err;
    }
    return mission;
  },

  async startMission(userId, missionId) {
    const mission = await this.getMissionById(missionId);

    // Atomically find or create mission attempt
    let attempt = await MissionAttempt.findOne({ userId, missionId: mission.missionId });
    if (!attempt) {
      attempt = await MissionAttempt.create({
        userId,
        missionId: mission.missionId,
        labId: mission.labId,
        status: 'in_progress',
        startedAt: new Date(),
      });
    } else if (attempt.status === 'not_started') {
      attempt.status = 'in_progress';
      attempt.startedAt = new Date();
      await attempt.save();
    }

    return {
      mission,
      attempt,
    };
  },

  async completeMission(userId, missionId, tasks = []) {
    const mission = await this.getMissionById(missionId);

    // 1. Idempotency Check: check if already completed
    let attempt = await MissionAttempt.findOne({ userId, missionId: mission.missionId });

    if (attempt && attempt.status === 'completed') {
      // Return existing completed attempt with 0 new XP awarded (strictly idempotent!)
      const progress = await Progress.findOne({ userId });
      return {
        success: true,
        alreadyCompleted: true,
        mission,
        attempt,
        xpAwarded: 0,
        totalXp: progress?.totalXp || 0,
        currentLevel: progress?.currentLevel || 3,
        message: 'Mission was already verified and completed.',
      };
    }

    // 2. Mark attempt completed
    if (!attempt) {
      attempt = new MissionAttempt({
        userId,
        missionId: mission.missionId,
        labId: mission.labId,
      });
    }

    attempt.status = 'completed';
    attempt.completedAt = new Date();
    attempt.xpAwarded = mission.xpReward;
    attempt.objectivesCompleted = tasks;
    await attempt.save();

    // 3. Award XP atomically
    const xpResult = await xpService.awardXp({
      userId,
      xp: mission.xpReward,
      source: 'mission',
      sourceId: mission.missionId,
    });

    // 4. Update Progress record (missionsCompleted map, badges, skillMatrix)
    const progress = await Progress.findOne({ userId });
    if (progress) {
      progress.missionsCompleted.set(mission.missionId, true);

      // Add badge if mission has one and not already awarded
      if (mission.badge && mission.badge.name) {
        const hasBadge = progress.badges.some((b) => b.name === mission.badge.name);
        if (!hasBadge) {
          progress.badges.push({
            emoji: mission.badge.emoji,
            name: mission.badge.name,
            unlockedAt: new Date(),
          });
        }
      }

      // Update skill matrix percentage for category
      const cat = mission.category;
      if (SKILL_CATEGORIES.includes(cat)) {
        const currentVal = progress.skillMatrix[cat] || 0;
        progress.skillMatrix[cat] = Math.min(100, currentVal + 15);
      }

      await progress.save();
    }

    // 5. Check if all 5 missions for this lab are completed to award Certificate
    const certificate = await certificateService.checkAndIssueCertificate(userId, mission.labId);

    return {
      success: true,
      alreadyCompleted: false,
      mission,
      attempt,
      xpAwarded: mission.xpReward,
      totalXp: xpResult.totalXp,
      currentLevel: xpResult.level,
      badge: mission.badge,
      certificateUnlocked: !!certificate,
      certificate,
      message: 'Mission objective secured successfully.',
    };
  },

  async getMissionProgress(userId, missionId) {
    const mission = await this.getMissionById(missionId);
    const attempt = await MissionAttempt.findOne({ userId, missionId: mission.missionId });
    return {
      mission,
      attempt: attempt || { status: 'not_started', xpAwarded: 0 },
    };
  },
};
