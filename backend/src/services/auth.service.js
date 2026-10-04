import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { Progress } from '../models/Progress.js';
import { generateToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { calculateLevelInfo } from '../utils/constants.js';

export const authService = {
  async registerUser({ name, email, callsign, password, role = 'user' }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already in use
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const err = new Error('An operator with this email address already exists.');
      err.code = 11000;
      err.statusCode = 409;
      throw err;
    }

    // Hash password securely (cost factor 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const cleanRaw = (callsign || '').trim();
    let safeCallsign = `0x${name.toUpperCase().replace(/\s+/g, '')}`;
    if (cleanRaw) {
      const stripped = cleanRaw.replace(/^0x/i, '').toUpperCase();
      safeCallsign = `0x${stripped}`;
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      callsign: safeCallsign,
      passwordHash,
      role: 'user',
      level: 1,
      xp: 0,
      themePreference: 'dark',
      lastLoginAt: new Date(),
    });

    // Initialize clean user Progress record
    await Progress.create({
      userId: user._id,
      totalXp: 0,
      currentLevel: 1,
      missionsCompleted: {},
      labsCompleted: [],
      badges: [],
      skillMatrix: {
        'AI Security': 0,
        'Cloud Infra': 0,
        'Forensics': 0,
        'Cryptography': 0,
        'Networking': 0,
        'Kubernetes': 0,
      },
    });

    // Generate JWT token and session
    const token = generateToken({ id: user._id, role: user.role });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    const session = await Session.create({
      userId: user._id,
      token,
      expiresAt,
    });

    logger.info('Operator registered successfully', { userId: user._id, callsign: user.callsign });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        callsign: user.callsign,
        avatar: user.avatar,
        role: user.role,
        level: user.level,
        xp: user.xp,
        themePreference: user.themePreference,
      },
      token,
      sessionId: session._id,
    };
  },

  async loginUser({ identifier, password, ipAddress = '127.0.0.1', userAgent = 'Unknown' }) {
    const cleanIdent = (identifier || '').trim();

    // Support login via email, callsign, or name (case-insensitive)
    const escapedIdent = cleanIdent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({
      $or: [
        { email: cleanIdent.toLowerCase() },
        { callsign: new RegExp(`^${escapedIdent}$`, 'i') },
        { name: new RegExp(`^${escapedIdent}$`, 'i') },
      ],
    }).select('+passwordHash');

    if (!user || !user.isActive) {
      logger.warn('Failed login attempt — operator not found', { identifier: cleanIdent });
      const err = new Error('Invalid credentials. Operator access denied.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      logger.warn('Failed login attempt — invalid password', { userId: user._id });
      const err = new Error('Invalid credentials. Operator access denied.');
      err.statusCode = 401;
      throw err;
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Generate session & token
    const token = generateToken({ id: user._id, role: user.role });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = await Session.create({
      userId: user._id,
      token,
      ipAddress,
      userAgent,
      expiresAt,
    });

    logger.info('Operator logged in successfully', { userId: user._id, callsign: user.callsign });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        callsign: user.callsign,
        avatar: user.avatar,
        role: user.role,
        level: user.level,
        xp: user.xp,
        themePreference: user.themePreference,
      },
      token,
      sessionId: session._id,
    };
  },

  async logoutUser({ token, userId }) {
    if (token) {
      await Session.updateMany(
        { token, userId, revokedAt: null },
        { revokedAt: new Date() }
      );
    }
    logger.info('Operator session revoked/terminated', { userId });
    return { success: true, message: 'Session terminated successfully' };
  },

  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      const err = new Error('Operator account not found or deactivated.');
      err.statusCode = 404;
      throw err;
    }

    const levelInfo = calculateLevelInfo(user.xp);

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      callsign: user.callsign,
      avatar: user.avatar,
      role: user.role,
      level: user.level,
      xp: user.xp,
      levelInfo,
      themePreference: user.themePreference,
      lastLoginAt: user.lastLoginAt,
    };
  },
};
