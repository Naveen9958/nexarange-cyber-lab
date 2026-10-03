// Structured logger utility adhering to strict zero-trust security guidelines.
// NEVER logs passwords, JWTs, cookies, or auth headers.

const formatTime = () => new Date().toISOString();

export const logger = {
  info: (msg, meta = {}) => {
    const cleanMeta = sanitizeMeta(meta);
    console.log(`[${formatTime()}] [INFO] ${msg}`, Object.keys(cleanMeta).length ? JSON.stringify(cleanMeta) : '');
  },
  warn: (msg, meta = {}) => {
    const cleanMeta = sanitizeMeta(meta);
    console.warn(`[${formatTime()}] [WARN] ${msg}`, Object.keys(cleanMeta).length ? JSON.stringify(cleanMeta) : '');
  },
  error: (msg, meta = {}) => {
    const cleanMeta = sanitizeMeta(meta);
    console.error(`[${formatTime()}] [ERROR] ${msg}`, Object.keys(cleanMeta).length ? JSON.stringify(cleanMeta) : '');
  },
  debug: (msg, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const cleanMeta = sanitizeMeta(meta);
      console.log(`[${formatTime()}] [DEBUG] ${msg}`, Object.keys(cleanMeta).length ? JSON.stringify(cleanMeta) : '');
    }
  },
};

function sanitizeMeta(meta) {
  if (!meta || typeof meta !== 'object') return {};
  const sanitized = { ...meta };
  const sensitiveKeys = ['password', 'passwordHash', 'passphrase', 'token', 'jwt', 'authorization', 'cookie', 'cookies', 'secret'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}
