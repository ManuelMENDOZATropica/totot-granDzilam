import { Router } from 'express';
import {
  getFinanceSettingsController,
  updateFinanceSettingsController,
} from '../controllers/finance-settings.controller';
import { requireAuth, requireRole } from '../middleware/auth';

export const financeSettingsRouter = Router();

financeSettingsRouter.get('/', getFinanceSettingsController);
financeSettingsRouter.put('/', requireAuth, requireRole('admin'), updateFinanceSettingsController);
