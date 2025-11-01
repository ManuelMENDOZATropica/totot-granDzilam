import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { loadEnv } from './config/env';
import { healthRouter } from './routes/health.routes';
import { errorHandler } from './middleware/error-handler';

export const createApp = () => {
  const { CORS_ORIGIN } = loadEnv();
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.use('/api/health', healthRouter);
  app.use('/api/healthz', healthRouter);

  app.use(errorHandler);

  return app;
};
