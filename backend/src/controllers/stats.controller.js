import { Progress } from '../models/Progress.js';
import { MissionAttempt } from '../models/MissionAttempt.js';
import { Mission } from '../models/Mission.js';
import { TerminalSession } from '../models/TerminalSession.js';
import { calculateRank, calculateLevelInfo, SKILL_CATEGORIES } from '../utils/constants.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const progress = await Progress.findOne({ userId });
    const completedMissionsCount = await MissionAttempt.countDocuments({ userId, status: 'completed' });
    const totalMissionsCount = (await Mission.countDocuments({ isActive: true })) || 10;

    const totalXp = progress?.totalXp || 0;
    const sessionXp = progress?.sessionXp || 0;
    const rank = calculateRank(totalXp);
    const levelInfo = calculateLevelInfo(totalXp);
    const badgesCount = progress?.badges?.length || 0;
    const completionRate = totalMissionsCount > 0 ? Math.round((completedMissionsCount / totalMissionsCount) * 100) : 0;

    return sendSuccess(res, {
      totalXp,
      sessionXp,
      rank,
      level: levelInfo.level,
      levelInfo,
      completedMissionsCount,
      totalMissionsCount,
      completionRate,
      badgesCount,
      threatLevel: 'GUARDED',
    });
  } catch (error) {
    next(error);
  }
};

export const getSkills = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const progress = await Progress.findOne({ userId });
    const completedAttempts = await MissionAttempt.find({ userId, status: 'completed' });

    // Calculate dynamic radar values from completed mission categories
    const skillMatrix = {};
    SKILL_CATEGORIES.forEach((cat) => {
      const storedVal = progress?.skillMatrix?.get ? progress.skillMatrix.get(cat) : (progress?.skillMatrix?.[cat] || 0);
      skillMatrix[cat] = Math.min(100, Math.max(15, storedVal));
    });

    const radarList = SKILL_CATEGORIES.map((name) => {
      const pct = skillMatrix[name] || 15;
      return {
        name,
        val: Math.min(0.95, pct / 100),
        displayPct: pct,
      };
    });

    return sendSuccess(res, {
      skillMatrix,
      radarList,
    });
  } catch (error) {
    next(error);
  }
};

export const getXpHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const progress = await Progress.findOne({ userId });

    const rawHistory = progress?.xpHistory || [];
    let accum = 0;
    const points = [{ label: 'Baseline', xp: 0, timestamp: progress?.createdAt || new Date() }];

    rawHistory.forEach((item, idx) => {
      accum += item.xp;
      points.push({
        label: `M0${idx + 1}`,
        xp: accum,
        timestamp: item.timestamp,
        source: item.source,
      });
    });

    return sendSuccess(res, {
      history: points,
      totalPoints: points.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sessions = await TerminalSession.find({ userId });
    const totalCommands = sessions.reduce((acc, s) => acc + (s.commandCount || 0), 0);

    return sendSuccess(res, {
      activeSessionsCount: sessions.filter((s) => s.status === 'active').length,
      totalSessionsCount: sessions.length,
      terminalCommandsExecuted: totalCommands,
      enclaveStatus: 'CONNECTED: LAB-01',
      tunnelProtocol: 'WireGuard mTLS / AES-256-GCM',
      threatLevel: 'GUARDED',
    });
  } catch (error) {
    next(error);
  }
};
