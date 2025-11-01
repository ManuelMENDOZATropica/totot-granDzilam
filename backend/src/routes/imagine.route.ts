import { Router } from 'express';
import { imagineDesign } from '../controllers/imagine.controller';
import { chatWithAssistant } from '../controllers/chatbot.controller';
import { imagineRateLimiter } from '../middleware/rate-limit';

export const imagineRouter = Router();

imagineRouter.post('/imagine', imagineRateLimiter, imagineDesign);
imagineRouter.post('/chatbot', chatWithAssistant);
