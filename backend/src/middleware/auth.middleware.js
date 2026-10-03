import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/apiResponse.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Read token from Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1].trim();
    }

    // Fallback: check signed or normal cookies if present
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. No session token provided.', 'UNAUTHORIZED', 401);
    }

    // 2. Validate token signature & expiration
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return sendError(res, 'Session token is invalid or has expired.', 'INVALID_TOKEN', 401);
    }

    // 3. Validate active session in database
    const session = await Session.findOne({
      token,
      userId: decoded.id,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return sendError(res, 'Session has been revoked or expired. Please re-authenticate.', 'SESSION_REVOKED', 401);
    }

    // 4. Find user and ensure account is active
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return sendError(res, 'User account not found or deactivated.', 'USER_INACTIVE', 401);
    }

    // 5. Attach safe context to request
    req.user = user;
    req.session = session;
    req.token = token;

    next();
  } catch (error) {
    return sendError(res, 'Authentication verification failed.', 'AUTH_ERROR', 401, error.message);
  }
};
