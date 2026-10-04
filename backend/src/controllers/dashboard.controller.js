import { Progress } from '../models/Progress.js';
import { MissionAttempt } from '../models/MissionAttempt.js';
import { Mission } from '../models/Mission.js';
import { calculateRank, calculateLevelInfo } from '../utils/constants.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user._id;

    const progress = await Progress.findOne({ userId });
    const completedAttempts = await MissionAttempt.find({ userId, status: 'completed' });
    const missionsTotal = await Mission.countDocuments({ isActive: true });

    const totalXp = user.xp || 0;
    const sessionXp = progress?.sessionXp || 0;
    const missionsCompleted = completedAttempts.length;
    const currentRank = calculateRank(totalXp);
    const levelInfo = calculateLevelInfo(totalXp);
    const completionPct = missionsTotal > 0 ? Math.round((missionsCompleted / missionsTotal) * 100) : 0;

    // Identify next pending mission
    const completedIds = completedAttempts.map((a) => a.missionId);
    const nextMission = await Mission.findOne({
      isActive: true,
      missionId: { $nin: completedIds },
    }).sort({ labId: 1, num: 1 });

    return sendSuccess(res, {
      user: {
        name: user.name,
        email: user.email,
        callsign: user.callsign,
        avatar: user.avatar,
        role: user.role,
        level: user.level,
        xp: user.xp,
        themePreference: user.themePreference,
      },
      xp: totalXp,
      sessionXp,
      level: levelInfo.level,
      levelInfo,
      currentRank,
      missionsCompleted,
      missionsTotal: missionsTotal || 10,
      completionRate: completionPct,
      securityPosture: 'DEFCON 4 · GUARDED',
      activeThreatChain: 'AGENT IDENTITY TAMPER',
      activeMission: nextMission
        ? {
            id: nextMission.missionId,
            labId: nextMission.labId,
            num: nextMission.num,
            title: nextMission.title,
            category: nextMission.category,
            xp: nextMission.xpReward,
          }
        : null,
      badges: progress?.badges || [],
    });
  } catch (error) {
    next(error);
  }
};
