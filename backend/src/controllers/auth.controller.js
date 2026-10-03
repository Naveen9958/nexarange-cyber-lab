import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, callsign, password, role } = req.body;
    const result = await authService.registerUser({
      name,
      email,
      callsign,
      password,
      role,
    });

    // Set secure HTTP-only cookie if configured
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, result, 'Operator account registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, email, callsign, password } = req.body;
    const loginIdent = identifier || email || callsign;

    if (!loginIdent || !password) {
      return sendError(res, 'Operator identifier and password are required', 'MISSING_CREDENTIALS', 400);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await authService.loginUser({
      identifier: loginIdent,
      password,
      ipAddress,
      userAgent,
    });

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, result, 'Operator authenticated successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.token;
    const userId = req.user?._id;

    await authService.logoutUser({ token, userId });

    res.clearCookie('token', {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
    });

    return sendSuccess(res, { sessionState: 'TERMINATED' }, 'Session terminated successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    const token = req.token;
    return sendSuccess(res, { user, token });
  } catch (error) {
    next(error);
  }
};
