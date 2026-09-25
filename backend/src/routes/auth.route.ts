import { Router } from 'express';
import { loginController, logoutController, meController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { createRateLimitMiddleware } from '../middleware/rate-limit';

export const authRouter = Router();

/**
 * C4 — El login no tenía límite. Doce contraseñas erróneas daban doce 401 sin bloqueo, y
 * además cada intento cuesta ~22 ms de CPU bloqueante por el PBKDF2: ocho peticiones
 * concurrentes degradaban /api/health de 0.5 ms a 98 ms. El límite corta las dos cosas.
 */
const limiteLogin = createRateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 });

authRouter.post('/login', limiteLogin, loginController);
authRouter.get('/me', requireAuth, meController);
authRouter.post('/logout', logoutController);
