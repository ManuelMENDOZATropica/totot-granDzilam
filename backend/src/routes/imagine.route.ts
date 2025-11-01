import { Router } from 'express';
import { imagineDesign } from '../controllers/imagine.controller';
import { imagineRateLimiter } from '../middleware/rate-limit';

export const imagineRouter = Router();

imagineRouter.post('/imagine', imagineRateLimiter, imagineDesign);
