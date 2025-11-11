import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/errors';
import { verifyAuthToken } from '../utils/jwt';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new HttpError(401, 'No autorizado');
  }

  const token = header.replace('Bearer ', '').trim();
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

export const requireRole = (role: keyof typeof ROLE_PRIORITY) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpError(401, 'No autorizado');
    }

    const userRole = req.user.role;
    if (ROLE_PRIORITY[userRole] < ROLE_PRIORITY[role]) {
      throw new HttpError(403, 'No tienes permisos para realizar esta acción');
    }

    next();
  };
};
