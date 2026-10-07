import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/errors';
import { verifyAuthToken } from '../utils/jwt';
import { readAuthCookie } from '../utils/cookies';
import { UserModel } from '../models/user.model';

/**
 * R2 — La cookie httpOnly es el camino normal. Se conserva el encabezado Bearer como
 * alternativa para clientes que no son un navegador (scripts, pruebas, integraciones):
 * ahí no hay riesgo de XSS porque no hay página donde inyectar nada.
 */
const leerToken = (req: Request): string | null => {
  const cookie = readAuthCookie(req);
  if (cookie) return cookie;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim() || null;
  }

  return null;
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = leerToken(req);
  if (!token) {
    throw new HttpError(401, 'No autorizado');
  }

  try {
    const payload = verifyAuthToken(token);
    req.user = payload;
    next();
  } catch (error) {
    throw new HttpError(401, 'Token inválido o expirado', error);
  }
};

const ROLE_PRIORITY = {
  viewer: 1,
  editor: 2,
  admin: 3,
} as const;

/**
 * El rol se lee de la base en cada petición, no del token: el token guarda el rol que
 * tenía el usuario al iniciar sesión, y un cambio de rol desde el CRM no se notaba
 * hasta que volviera a entrar (hasta 12 h después).
 */
export const requireRole = (role: keyof typeof ROLE_PRIORITY) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpError(401, 'No autorizado');
      }

      const user = await UserModel.findById(req.user.sub).select('role').lean();
      if (!user) {
        throw new HttpError(401, 'No autorizado');
      }

      req.user.role = user.role;
      if (ROLE_PRIORITY[user.role] < ROLE_PRIORITY[role]) {
        throw new HttpError(403, 'No tienes permisos para realizar esta acción');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
