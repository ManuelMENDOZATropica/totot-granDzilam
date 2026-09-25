import type { Request, Response } from 'express';
import { loadEnv } from '../config/env';

/**
 * R2 — La sesión viajaba en el cuerpo del login y el frontend la guardaba en
 * localStorage, donde cualquier script inyectado en la página podía leerla. Un token
 * robado seguía siendo válido sus 12 horas completas y no había forma de revocarlo.
 *
 * Con una cookie httpOnly el JavaScript de la página ya no puede leer la sesión: solo el
 * navegador la adjunta a las peticiones al backend.
 */

export const AUTH_COOKIE = 'gd_session';

/** Debe coincidir con el TTL del token en utils/jwt.ts. */
const MAX_AGE_SEGUNDOS = 60 * 60 * 12;

/**
 * En producción el frontend (grandzilam.com) y el backend (onrender.com) son sitios
 * distintos, así que la cookie necesita SameSite=None, y eso obliga a Secure. En local
 * ambos son localhost: SameSite=Lax funciona y Secure rompería sobre http.
 */
const esCrossSite = () => loadEnv().CORS_ORIGIN.startsWith('https:');

export const setAuthCookie = (res: Response, token: string) => {
  const cross = esCrossSite();
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: cross,
    sameSite: cross ? 'none' : 'lax',
    maxAge: MAX_AGE_SEGUNDOS * 1000,
    path: '/',
  });
};

export const clearAuthCookie = (res: Response) => {
  const cross = esCrossSite();
  res.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: cross,
    sameSite: cross ? 'none' : 'lax',
    path: '/',
  });
};

/**
 * Lee la cookie sin depender de cookie-parser: Express no la parsea de serie y añadir
 * middleware global por un solo valor no compensa.
 */
export const readAuthCookie = (req: Request): string | null => {
  const header = req.headers.cookie;
  if (!header) return null;

  for (const parte of header.split(';')) {
    const separador = parte.indexOf('=');
    if (separador === -1) continue;
    if (parte.slice(0, separador).trim() !== AUTH_COOKIE) continue;
    const valor = decodeURIComponent(parte.slice(separador + 1).trim());
    return valor || null;
  }

  return null;
};
