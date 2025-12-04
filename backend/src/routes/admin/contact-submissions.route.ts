import { Router } from 'express';
import {
  assignContactSubmissionController,
  listAdminContactSubmissionsController,
} from '../../controllers/contact-submissions.controller';

export const adminContactSubmissionsRouter = Router();

adminContactSubmissionsRouter.get('/', listAdminContactSubmissionsController);
adminContactSubmissionsRouter.patch('/:id', assignContactSubmissionController);
