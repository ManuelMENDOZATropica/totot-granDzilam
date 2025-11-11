import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { loadEnv } from './config/env';
import { healthRouter } from './routes/health.routes';
import { lotsRouter } from './routes/lots.route';
import { financeRouter } from './routes/finance.route';
import { imagineRouter } from './routes/imagine.route';
import { errorHandler } from './middleware/error-handler';
import { authRouter } from './routes/auth.route';
import { financeSettingsRouter } from './routes/finance-settings.route';
import { adminRouter } from './routes/admin';
import { requireAuth, requireRole } from './middleware/auth';

export const createApp = () => {
  const { CORS_ORIGIN } = loadEnv();
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.use('/api/health', healthRouter);
  app.use('/api/healthz', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/lots', lotsRouter);
  app.use('/api/finance', financeRouter);
  app.use('/api/finance-settings', financeSettingsRouter);
  app.use('/api/admin', requireAuth, requireRole('admin'), adminRouter);
  app.use('/api', imagineRouter);

  app.use(errorHandler);

  return app;
};
