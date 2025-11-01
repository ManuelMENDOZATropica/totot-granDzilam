import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

const cleanupStaleEntries = (store: Map<string, RateLimitEntry>, now: number) => {
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
};

export const createRateLimitMiddleware = (options: RateLimitOptions) => {
  const { windowMs, max, keyGenerator } = options;
  const store = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (store.size > 2000) {
      cleanupStaleEntries(store, now);
    }

    const key = keyGenerator?.(req) ?? req.ip ?? req.socket.remoteAddress ?? 'global';
    const entry = store.get(key);

    if (entry && entry.expiresAt > now) {
      if (entry.count >= max) {
        logger.warn('Rate limit exceeded', { key });
        res.status(429).json({
          ok: false,
          error: 'RATE_LIMITED',
          message: 'Has superado el límite de 20 solicitudes en 10 minutos.',
        });
        return;
      }

      entry.count += 1;
      store.set(key, entry);
      next();
      return;
    }

    store.set(key, { count: 1, expiresAt: now + windowMs });
    next();
  };
};

export const imagineRateLimiter = createRateLimitMiddleware({
  windowMs: 10 * 60 * 1000,
  max: 20,
});
