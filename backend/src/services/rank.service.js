import { User } from '../models/User.js';
import { calculateRank, calculateLevelInfo } from '../utils/constants.js';

// Base mock leaderboard profiles matching frontend data
const BASE_LEADERBOARD = [
  { rank: 1, name: '0xVORTEX', callsign: '0xVORTEX', xp: 4850, track: 'AI Security Lead', badge: '🥇' },
  { rank: 2, name: 'cipher_null', callsign: '0xCIPHER', xp: 4420, track: 'Zero Trust Architect', badge: '🥈' },
  { rank: 3, name: 'Astra_Sec', callsign: '0xASTRA', xp: 4180, track: 'Cloud Forensics', badge: '🥉' },
  { rank: 4, name: 'k8s_ghost', callsign: '0xGHOST', xp: 3920, track: 'Kubernetes Defense', badge: '⭐' },
  { rank: 5, name: 'devika_iam', callsign: '0xDEVIKA', xp: 3750, track: 'Identity & Access', badge: '⭐' },
  { rank: 6, name: 'quantum_bit', callsign: '0xQBIT', xp: 3510, track: 'Post-Quantum Crypto', badge: '⭐' },
  { rank: 7, name: 'red_agent', callsign: '0xREDAGENT', xp: 3340, track: 'AI Red Teaming', badge: '⭐' },
  { rank: 8, name: 'simran_k', callsign: '0xSIMRAN', xp: 3100, track: 'Prompt Security', badge: '⭐' },
];

export const rankService = {
  async getUserRank(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const rank = calculateRank(user.xp);
    const levelInfo = calculateLevelInfo(user.xp);
    const nextMilestoneXp = 500;
    const xpToNextRank = Math.max(0, nextMilestoneXp - user.xp);

    return {
      rank,
      level: user.level,
      xp: user.xp,
      xpToNextRank,
      nextMilestoneXp,
      levelInfo,
      percentile: rank <= 50 ? 'Top 5%' : rank <= 150 ? 'Top 15%' : 'Top 25%',
    };
  },

  async getLeaderboard(userId) {
    const user = await User.findById(userId);
    const currentRank = user ? calculateRank(user.xp) : 247;
    const userXp = user ? user.xp : 0;
    const userName = user ? user.name : 'You';
    const userCallsign = user ? user.callsign : '0xOPERATOR';

    const userEntry = {
      rank: currentRank,
      name: `${userName} (YOU)`,
      callsign: userCallsign,
      xp: userXp,
      track: userXp > 500 ? 'AI Security Analyst' : 'Enclave Trainee',
      badge: '🎯',
      isMe: true,
    };

    return [
      ...BASE_LEADERBOARD,
      userEntry,
    ];
  },
};
