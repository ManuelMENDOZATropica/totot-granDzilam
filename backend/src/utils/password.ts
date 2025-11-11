import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

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
