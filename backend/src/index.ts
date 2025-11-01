import { createServer } from 'http';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { loadEnv } from './config/env';
import { logger } from './utils/logger';

const bootstrap = async () => {
  const env = loadEnv();
  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`API server listening on port ${env.PORT}`);
  });

  void connectDatabase();
};

bootstrap().catch((error) => {
  logger.error('Failed to bootstrap server', error);
  process.exit(1);
});
