import { Router } from 'express';
import { adminLotsRouter } from './lots.route';
import { adminUsersRouter } from './users.route';
import { financeSettingsRouter } from '../finance-settings.route';
import { adminContactSubmissionsRouter } from './contact-submissions.route';

export const adminRouter = Router();

adminRouter.use('/lots', adminLotsRouter);
adminRouter.use('/users', adminUsersRouter);
adminRouter.use('/finance-settings', financeSettingsRouter);
adminRouter.use('/contact-submissions', adminContactSubmissionsRouter);
