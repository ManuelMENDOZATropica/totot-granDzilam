import { NextFunction, Request, Response } from 'express';
import { isHttpError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (isHttpError(err)) {
    logger.warn(`Request failed: ${err.message}`, err.details);
    res.status(err.statusCode).json({ message: err.message, details: err.details });
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal server error' });
};
