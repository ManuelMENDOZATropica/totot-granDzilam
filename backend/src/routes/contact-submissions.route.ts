import { Router } from 'express';
import {
  createContactSubmissionController,
  listAssignedContactSubmissionsController,
} from '../controllers/contact-submissions.controller';
import { requireAuth } from '../middleware/auth';

export const contactSubmissionsRouter = Router();

contactSubmissionsRouter.post('/', createContactSubmissionController);
contactSubmissionsRouter.get('/', requireAuth, listAssignedContactSubmissionsController);
