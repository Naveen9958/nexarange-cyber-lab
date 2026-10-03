import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    // Attempt standard connection to MONGODB_URI
    mongoose.set('strictQuery', true);
    
    // Try connecting to configured MONGODB_URI with a short serverSelectionTimeoutMS
    try {
      const conn = await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 2500,
      });
      logger.info('MongoDB Connected', { host: conn.connection.host, port: conn.connection.port });
      return conn;
    } catch (initialErr) {
      // In development or test environments, if local mongod is not running, provide an automatic in-memory fallback
      if (env.NODE_ENV !== 'production') {
        logger.warn('Direct connection to MONGODB_URI failed. Initializing local in-memory MongoDB fallback for testing & local development...');
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          mongodInstance = await MongoMemoryServer.create({
            instance: {
              dbName: 'nexarange',
            },
          });
          const uri = mongodInstance.getUri();
          const conn = await mongoose.connect(uri);
          logger.info('MongoDB Connected', { host: 'in-memory-mongo', uri });
          return conn;
        } catch (memErr) {
          logger.error('Failed to start in-memory MongoDB fallback', { error: memErr.message });
          throw initialErr;
        }
      } else {
        throw initialErr;
      }
    }
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
    logger.info('MongoDB Disconnected');
  } catch (err) {
    logger.error('Error during database disconnect', { error: err.message });
  }
};
