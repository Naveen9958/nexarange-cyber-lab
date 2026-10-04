import bcrypt from 'bcryptjs';
import { User, generateAvatarInitials } from '../models/User.js';
import { Session } from '../models/Session.js';
import { Progress } from '../models/Progress.js';
import { generateToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { calculateLevelInfo } from '../utils/constants.js';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const authService = {
  async registerUser({ fullName, name, username, callsign, email, password, role = 'Fresher / Trainee' }) {
    const realName = (fullName || name || '').trim();
    if (!realName) {
      const err = new Error('This field is required.');
      err.field = 'fullName';
      err.statusCode = 400;
      throw err;
    }

    // Determine username / callsign
    const rawUsername = (username || (callsign ? callsign.replace(/^0x/i, '') : realName)).trim();
    if (!rawUsername) {
      const err = new Error('This field is required.');
      err.field = 'username';
      err.statusCode = 400;
      throw err;
    }
    const normalizedUsername = rawUsername.toLowerCase();

    // Validate email
    const rawEmail = (email || '').trim();
    if (!rawEmail) {
      const err = new Error('This field is required.');
      err.field = 'email';
      err.statusCode = 400;
      throw err;
    }
    const normalizedEmail = rawEmail.toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      const err = new Error('Enter a valid email address.');
      err.field = 'email';
      err.statusCode = 400;
      throw err;
    }

    // Validate password
    if (!password || password.length < 6) {
      const err = new Error('Password must be at least 6 characters long.');
      err.field = 'password';
      err.statusCode = 400;
      throw err;
    }

    // Check duplicate username and email independently
    const existingByUsername = await User.findOne({ username: normalizedUsername });
    const existingByEmail = await User.findOne({ email: normalizedEmail });

    if (existingByUsername && existingByEmail) {
      const err = new Error('An account with this username and email already exists.');
      err.code = 'DUPLICATE_KEY';
      err.statusCode = 409;
      throw err;
    }
    if (existingByUsername) {
      const err = new Error('Username already exists. Please choose another username.');
      err.code = 'DUPLICATE_KEY';
      err.statusCode = 409;
      throw err;
    }
    if (existingByEmail) {
      const err = new Error('An account with this email already exists.');
      err.code = 'DUPLICATE_KEY';
      err.statusCode = 409;
      throw err;
    }

    // Hash password securely (cost factor 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Compute callsign and avatar
    const safeCallsign = callsign && callsign.trim()
      ? `0x${callsign.trim().replace(/^0x/i, '').toUpperCase()}`
      : `0x${normalizedUsername.toUpperCase()}`;
    const avatar = generateAvatarInitials(realName);

    const safeRole = role === 'user' ? 'Fresher / Trainee' : (role || 'Fresher / Trainee');

    const user = await User.create({
      name: realName,
      username: normalizedUsername,
      email: normalizedEmail,
      callsign: safeCallsign,
      passwordHash,
      role: safeRole,
      avatar,
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

    logger.info('Operator registered successfully', { userId: user._id, username: user.username, callsign: user.callsign });

    return {
      user: {
        id: user._id,
        fullName: user.name,
        name: user.name,
        username: user.username,
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
    if (!cleanIdent || !password) {
      const err = new Error('Operator username or email and password are required.');
      err.statusCode = 400;
      throw err;
    }

    const lowerIdent = cleanIdent.toLowerCase();
    const escapedIdent = cleanIdent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Authenticate ONLY by email, username, or exact callsign — NEVER by display name / full name!
    const user = await User.findOne({
      $or: [
        { email: lowerIdent },
        { username: lowerIdent },
        { callsign: new RegExp(`^${escapedIdent}$`, 'i') },
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

    logger.info('Operator logged in successfully', { userId: user._id, username: user.username, callsign: user.callsign });

    return {
      user: {
        id: user._id,
        fullName: user.name,
        name: user.name,
        username: user.username,
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
      fullName: user.name,
      name: user.name,
      username: user.username,
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
