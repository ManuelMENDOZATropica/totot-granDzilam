import { Router } from 'express';
import { imagineDesign } from '../controllers/imagine.controller';
import { chatWithAssistant } from '../controllers/chatbot.controller';
import { createRateLimitMiddleware, imagineRateLimiter } from '../middleware/rate-limit';

export const imagineRouter = Router();

imagineRouter.post('/imagine', imagineRateLimiter, imagineDesign);
// C5 — El chatbot llama a OpenAI y estaba abierto sin autenticación ni límite: cualquiera
// podía gastar el presupuesto en un bucle. Ventana más holgada que la de imagine porque
// una conversación normal encadena varios mensajes.
const limiteChatbot = createRateLimitMiddleware({ windowMs: 10 * 60 * 1000, max: 40 });

imagineRouter.post('/chatbot', limiteChatbot, chatWithAssistant);
