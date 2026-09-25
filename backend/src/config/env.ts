import 'dotenv/config';
import { z } from 'zod';

/**
 * Una variable declarada pero vacía (`GEMINI_API_KEY=` en el .env) llega como cadena
 * vacía, no como undefined, y reventaba la validación de cualquier campo opcional.
 * Esto la trata como ausente, que es lo que el autor del .env quiso decir.
 */
const vacioEsAusente = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), schema);

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().url().or(z.string().startsWith('mongodb://')),
  JWT_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
  DEFAULT_ADMIN_PASSWORD: vacioEsAusente(z.string().min(8).optional()),
  OPENAI_API_KEY: vacioEsAusente(z.string().min(1).optional()),
  /** Familia de imagen de Gemini («Nano Banana»), usada para editar la ortofoto del lote. */
  GEMINI_API_KEY: vacioEsAusente(z.string().min(1).optional()),
  /** Qué motor usa «Imagina tu proyecto». Por defecto gemini si hay llave. */
  IMAGINE_PROVIDER: vacioEsAusente(z.enum(['gemini', 'openai']).optional()),
  GEMINI_IMAGE_MODEL: vacioEsAusente(
    z.enum(['gemini-3.1-flash-image', 'gemini-3-pro-image', 'gemini-3.1-flash-lite-image']).optional(),
  ),
  USE_MOCK_OPENAI: vacioEsAusente(
    z.union([z.literal('true'), z.literal('false'), z.literal('1'), z.literal('0')]).optional(),
  ),
  OPENAI_TIMEOUT_MS: vacioEsAusente(z.coerce.number().int().positive().optional()),
  OPENAI_MAX_ATTEMPTS: vacioEsAusente(z.coerce.number().int().positive().optional()),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export const loadEnv = (): Env => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('[env] Invalid environment configuration:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
};
