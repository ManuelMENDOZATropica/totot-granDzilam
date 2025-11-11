import { createHmac, timingSafeEqual } from 'crypto';
import { loadEnv } from '../config/env';
import type { UserRole } from '../models/user.model';

const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const base64UrlEncode = (input: Buffer | string): string => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (input: string): Buffer => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const paddingNeeded = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(paddingNeeded);
  return Buffer.from(padded, 'base64');
};

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
  iat: number;
  exp: number;
}

interface SignAuthTokenInput {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

const getSecret = (): string => {
  const { JWT_SECRET } = loadEnv();
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return JWT_SECRET;
};

const createSignature = (headerSegment: string, payloadSegment: string, secret: string): Buffer => {
  return createHmac('sha256', secret).update(`${headerSegment}.${payloadSegment}`).digest();
};

export const signAuthToken = ({ userId, email, role, name }: SignAuthTokenInput): string => {
  const secret = getSecret();
  const headerSegment = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: AuthTokenPayload = {
    sub: userId,
    email,
    role,
    name,
    iat: issuedAt,
    exp: issuedAt + TOKEN_TTL_SECONDS,
  };
  const payloadSegment = base64UrlEncode(JSON.stringify(payload));
  const signature = createSignature(headerSegment, payloadSegment, secret);
  const signatureSegment = base64UrlEncode(signature);
  return `${headerSegment}.${payloadSegment}.${signatureSegment}`;
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const secret = getSecret();
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token');
  }

  const [headerSegment, payloadSegment, signatureSegment] = parts;
  const expectedSignature = createSignature(headerSegment, payloadSegment, secret);
  const providedSignature = base64UrlDecode(signatureSegment);

  if (expectedSignature.length !== providedSignature.length) {
    throw new Error('Invalid token signature');
  }

  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    throw new Error('Invalid token signature');
  }

  const payloadJson = base64UrlDecode(payloadSegment).toString('utf8');
  const payload = JSON.parse(payloadJson) as Partial<AuthTokenPayload>;

  if (!payload.sub || !payload.email || !payload.role || !payload.name || !payload.exp || !payload.iat) {
    throw new Error('Invalid token payload');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    throw new Error('Token expired');
  }

  return payload as AuthTokenPayload;
};
