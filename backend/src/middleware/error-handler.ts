import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { isHttpError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // C2 — Varios controladores llaman a schema.parse() y dejan escapar el ZodError. Sin
  // esta rama terminaban en el catch genérico: el usuario veía «Internal server error» en
  // vez de qué campo corrigió mal, y cada validación fallida se registraba como error.
  if (err instanceof ZodError) {
    const campos = err.flatten().fieldErrors;
    const primero = Object.values(campos).flat().find(Boolean);
    logger.warn('Entrada inválida', { campos: Object.keys(campos).length });
    res.status(400).json({
      ok: false,
      error: 'INVALID_INPUT',
      message: primero ?? 'Los datos enviados no son válidos',
      details: campos,
    });
    return;
  }

  if (isHttpError(err)) {
    logger.warn(`Request failed: ${err.message}`, err.details);
    res.status(err.statusCode).json({ message: err.message, details: err.details });
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal server error' });
};
