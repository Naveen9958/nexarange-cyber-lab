import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { env } from './config/env.js';
import { sendSuccess } from './utils/apiResponse.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import missionRoutes from './routes/mission.routes.js';
import labRoutes from './routes/lab.routes.js';
import terminalRoutes from './routes/terminal.routes.js';
import progressRoutes from './routes/progress.routes.js';
import statsRoutes from './routes/stats.routes.js';
import rankRoutes from './routes/rank.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import squadRoutes from './routes/squad.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// 1. Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Compatible with frontend dev & single page app
    crossOriginEmbedderPolicy: false,
  })
);

// 2. CORS Configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Request Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// 4. Request Logging (Structured / Clean, never logging secrets)
if (env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
}

// 5. Global API Rate Limiting
app.use('/api', apiLimiter);

// 6. Health Check Endpoint (Rule 50)
app.get('/api/health', (req, res) => {
  return sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
});

// 7. Mount Application API Routes (Rule 53)
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/rank', rankRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/squad', squadRoutes);
app.use('/api/notifications', notificationRoutes);

// 8. 404 Handler
app.use(notFound);

// 9. Centralized Error Handler
app.use(errorHandler);

export default app;
