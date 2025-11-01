import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { loadEnv } from './env';

export const connectDatabase = async (): Promise<void> => {
  const { MONGO_URI } = loadEnv();

  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.warn('Failed to connect to MongoDB. Continuing without database connection.', error);
  }
};
