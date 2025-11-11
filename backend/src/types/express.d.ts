import type { AuthTokenPayload } from '../utils/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthTokenPayload;
  }
}
