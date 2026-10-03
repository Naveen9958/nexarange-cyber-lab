import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { seedInitialData } from './seed/seed.js';

let server = null;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Automatically seed initial mission & lab content if empty
    try {
      await seedInitialData();
    } catch (seedErr) {
      logger.warn('Seed initialization notice:', { message: seedErr.message });
    }

    // 3. Start Express Server
    server = app.listen(env.PORT, () => {
      logger.info(`NexaRange Command Center API running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // 4. Graceful Shutdown Handlers
    const handleShutdown = async (signal) => {
      logger.info(`Received ${signal}. Initiating graceful shutdown...`);
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed.');
          await disconnectDB();
          process.exit(0);
        });
      } else {
        await disconnectDB();
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    // 5. Handle Uncaught Exceptions & Unhandled Rejections
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception occurred', { error: err.message, stack: err.stack });
      // Non-zero exit after logging
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', { reason });
    });
  } catch (error) {
    logger.error('Critical failure during server startup', { error: error.message });
    process.exit(1);
  }
};

startServer();
