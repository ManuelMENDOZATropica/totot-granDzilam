import { Router } from 'express';
import {
  createContactSubmissionController,
  listAssignedContactSubmissionsController,
} from '../controllers/contact-submissions.controller';
import { requireAuth } from '../middleware/auth';
import { createRateLimitMiddleware } from '../middleware/rate-limit';

export const contactSubmissionsRouter = Router();

/**
 * C6 — El alta de contactos es pública y no tenía freno: quince envíos seguidos daban
 * quince 201. Combinado con que el CRM no permitía borrar, el spam quedaba ahí para
 * siempre. El DELETE se añadió en routes/admin/contact-submissions.route.ts.
 */
const limiteContacto = createRateLimitMiddleware({ windowMs: 60 * 60 * 1000, max: 5 });

contactSubmissionsRouter.post('/', limiteContacto, createContactSubmissionController);
contactSubmissionsRouter.get('/', requireAuth, listAssignedContactSubmissionsController);
