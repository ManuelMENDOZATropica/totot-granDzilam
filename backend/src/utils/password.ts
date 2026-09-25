import { pbkdf2, pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

/**
 * C4 — pbkdf2Sync bloquea el event loop mientras corre (~22 ms por intento con estas
 * iteraciones). Medido: ocho logins concurrentes llevaban /api/health de 0.5 ms a 98 ms.
 * Las versiones asíncronas hacen el trabajo en el threadpool y dejan el loop libre.
 * Las síncronas se mantienen para la semilla, que corre una vez al arrancar.
 */
const pbkdf2Async = promisify(pbkdf2);

const ITERATIONS = 120_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${salt}:${ITERATIONS}:${hash}`;
};

export const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, iterationsStr, hashHex] = stored.split(':');
  if (!salt || !iterationsStr || !hashHex) {
    return false;
  }

  const iterations = Number.parseInt(iterationsStr, 10);
  if (!Number.isFinite(iterations)) {
    return false;
  }

  const derived = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString('hex');
  const storedBuffer = Buffer.from(hashHex, 'hex');
  const derivedBuffer = Buffer.from(derived, 'hex');

  if (storedBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedBuffer);
};

export const hashPasswordAsync = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex');
  const hash = (await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)).toString('hex');
  return `${salt}:${ITERATIONS}:${hash}`;
};

export const verifyPasswordAsync = async (password: string, stored: string): Promise<boolean> => {
  const [salt, iterationsStr, hashHex] = stored.split(':');
  if (!salt || !iterationsStr || !hashHex) return false;

  const iterations = Number.parseInt(iterationsStr, 10);
  if (!Number.isFinite(iterations)) return false;

  const derived = await pbkdf2Async(password, salt, iterations, KEY_LENGTH, DIGEST);
  const storedBuffer = Buffer.from(hashHex, 'hex');
  if (storedBuffer.length !== derived.length) return false;

  return timingSafeEqual(storedBuffer, derived);
};
