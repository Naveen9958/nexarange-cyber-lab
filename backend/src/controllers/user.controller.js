import { User } from '../models/User.js';
import { THEMES, calculateLevelInfo } from '../utils/constants.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const levelInfo = calculateLevelInfo(user.xp);

    return sendSuccess(res, {
      name: user.name,
      email: user.email,
      callsign: user.callsign,
      avatar: user.avatar,
      role: user.role,
      level: user.level,
      xp: user.xp,
      levelInfo,
      themePreference: user.themePreference,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = {};
    const { name, avatar, callsign } = req.body;

    if (typeof name === 'string' && name.trim()) {
      allowedUpdates.name = name.trim();
    }
    if (typeof avatar === 'string' && avatar.trim()) {
      allowedUpdates.avatar = avatar.trim().charAt(0).toUpperCase();
    }
    if (typeof callsign === 'string' && callsign.trim()) {
      const cleanCallsign = callsign.trim().toUpperCase();
      allowedUpdates.callsign = cleanCallsign.startsWith('0X') ? cleanCallsign : `0x${cleanCallsign}`;
    }

    const updated = await User.findByIdAndUpdate(req.user._id, allowedUpdates, { new: true });

    return sendSuccess(res, {
      name: updated.name,
      email: updated.email,
      callsign: updated.callsign,
      avatar: updated.avatar,
      role: updated.role,
      level: updated.level,
      xp: updated.xp,
      themePreference: updated.themePreference,
    }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, {
      themePreference: user.themePreference || 'dark',
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { themePreference } = req.body;

    if (!themePreference || !THEMES.includes(themePreference)) {
      return sendError(
        res,
        `Invalid themePreference. Supported values are: ${THEMES.join(', ')}`,
        'INVALID_THEME',
        400
      );
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { themePreference },
      { new: true }
    );

    return sendSuccess(res, {
      themePreference: updated.themePreference,
    }, 'Theme preference updated successfully');
  } catch (error) {
    next(error);
  }
};
