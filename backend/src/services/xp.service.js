import { User } from '../models/User.js';
import { Progress } from '../models/Progress.js';
import { calculateLevelInfo } from '../utils/constants.js';

export const xpService = {
  /**
   * Atomically award XP to an operator from a verified source
   */
  async awardXp({ userId, xp, source, sourceId }) {
    if (!xp || xp <= 0) return null;

    // 1. Fetch current progress
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = await Progress.create({ userId });
    }

    const newTotalXp = progress.totalXp + xp;
    const newSessionXp = progress.sessionXp + xp;
    const levelInfo = calculateLevelInfo(newTotalXp);

    // 2. Atomically update progress record
    progress.totalXp = newTotalXp;
    progress.sessionXp = newSessionXp;
    progress.currentLevel = levelInfo.level;
    progress.lastActivityAt = new Date();

    progress.xpHistory.push({
      source,
      sourceId,
      xp,
      timestamp: new Date(),
    });

    await progress.save();

    // 3. Atomically update User record
    await User.findByIdAndUpdate(userId, {
      xp: newTotalXp,
      level: levelInfo.level,
    });

    return {
      awarded: xp,
      totalXp: newTotalXp,
      sessionXp: newSessionXp,
      level: levelInfo.level,
      levelInfo,
    };
  },
};
