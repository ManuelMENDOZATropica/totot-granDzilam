import { loadEnv } from '../config/env';
import { logger } from '../utils/logger';
import { buildCacheKey } from '../utils/prompt';
import { requestOpenAI } from './openai.request';

export type ImagineImageSize = '1024x1024' | '1024x1536' | '1536x1024';

export interface ImagineRequestPayload {
  prompt: string;
  size?: ImagineImageSize;
}

export interface ImagineResult {
  textoInspirador: string;
  promptVisual: string;
  imageUrl: string | null;
}

interface CacheEntry {
  value: ImagineResult;
  expiresAt: number;
}

interface ImagineServiceDependencies {
  cache?: Map<string, CacheEntry>;
  now?: () => number;
  useMock?: boolean;
  apiKey?: string | null;
  fetchImpl?: typeof fetch;
}

const DEFAULT_SIZE: ImagineImageSize = '1024x1024';
const CACHE_TTL_MS = 10 * 60 * 1000;
const TEXT_MODEL = 'gpt-4o-mini';
const IMAGE_MODEL = 'gpt-image-1';
const CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const IMAGE_URL = 'https://api.openai.com/v1/images/generations';

const parseImagineResponse = (payload: string): { textoInspirador: string; promptVisual: string } => {
  try {
    const parsed = JSON.parse(payload) as Partial<ImagineResult>;

    const textoInspirador = typeof parsed.textoInspirador === 'string' ? parsed.textoInspirador.trim() : '';
    const promptVisual = typeof parsed.promptVisual === 'string' ? parsed.promptVisual.trim() : '';

    if (!textoInspirador || !promptVisual) {
      throw new Error('Invalid response format');
    }

    return { textoInspirador, promptVisual };
  } catch (error) {
    logger.error('Failed to parse imagine response', error);
    throw new Error('INVALID_IMAGINE_RESPONSE');
  }
};

const resolveImageUrl = (data: any): string | null => {
  const asset = Array.isArray(data?.data) ? data.data[0] : undefined;
  if (!asset) {
    return null;
  }

  if (typeof asset.url === 'string' && asset.url.length > 0) {
    return asset.url;
  }

  if (typeof asset.b64_json === 'string' && asset.b64_json.length > 0) {
    return `data:image/png;base64,${asset.b64_json}`;
  }

  return null;
};

export type ImagineServiceErrorCode = 'INVALID_PROMPT_OR_FORMAT' | 'OPENAI_QUOTA' | 'OPENAI_AUTH' | 'OPENAI_UPSTREAM';

export const createImagineService = (deps: ImagineServiceDependencies = {}) => {
  const cache = deps.cache ?? new Map<string, CacheEntry>();
  const now = deps.now ?? Date.now;
  const env = loadEnv();
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new Error('Fetch implementation is required');
  }

  const envMock = env.USE_MOCK_OPENAI;
  const useMock = deps.useMock ?? (typeof envMock === 'string' ? envMock === 'true' || envMock === '1' : false);

  const apiKey = deps.apiKey ?? env.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? null;

  if (!useMock && !apiKey) {
    throw new Error('OPENAI_API_KEY is required when USE_MOCK_OPENAI is disabled');
  }

  const generateImaginedDesign = async (payload: ImagineRequestPayload): Promise<ImagineResult> => {
    const size = payload.size ?? DEFAULT_SIZE;
    const cacheKey = buildCacheKey(payload.prompt, size);
    const currentTime = now();
    const cached = cache.get(cacheKey);

    if (cached && cached.expiresAt > currentTime) {
      logger.info('Imagine generation completed', { size, cached: true });
      return cached.value;
    }

    if (useMock) {
      const textoInspirador = `Imagina ${payload.prompt} con espacios abiertos y detalles que invitan a disfrutar cada momento.`;
      const promptVisual = `Minimal realistic rendering of ${payload.prompt} at a coastal eco retreat, soft morning light, natural materials, lush vegetation, calm atmosphere, eye-level wide composition.`;
      const mockResult: ImagineResult = {
        textoInspirador,
        promptVisual,
        imageUrl: 'https://placehold.co/1024x1024?text=Gran+Dzilam',
      };
      cache.set(cacheKey, { value: mockResult, expiresAt: currentTime + CACHE_TTL_MS });
      logger.info('Imagine generation completed', { size, cached: false });
      return mockResult;
    }

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing');
    }

    try {
      const chatResponse = await requestOpenAI<any>({
        fetchImpl,
        url: CHAT_URL,
        apiKey,
        timeoutMs: 30000,
        body: {
          model: TEXT_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are a creative real-estate assistant. Return ONLY valid json (json) with keys: textoInspirador (≤40 words, Spanish) and promptVisual (English, minimal realistic style). No extra text.',
            },
            { role: 'user', content: `${payload.prompt}\n\nOutput: json` },
          ],
          temperature: 0.8,
          max_tokens: 220,
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'gran_dzilam_imagine',
              schema: {
                type: 'object',
                additionalProperties: false,
                required: ['textoInspirador', 'promptVisual'],
                properties: {
                  textoInspirador: { type: 'string', maxLength: 320 },
                  promptVisual: { type: 'string', maxLength: 600 },
                },
              },
            },
          },
        },
      });

      const content = chatResponse?.choices?.[0]?.message?.content ?? '';
      const parsed = parseImagineResponse(content);

      const imageResponse = await requestOpenAI<any>({
        fetchImpl,
        url: IMAGE_URL,
        apiKey,
        timeoutMs: 30000,
        body: {
          model: IMAGE_MODEL,
          prompt: parsed.promptVisual,
          size,
        },
      });

      const imageUrl = resolveImageUrl(imageResponse);

      const result: ImagineResult = {
        textoInspirador: parsed.textoInspirador,
        promptVisual: parsed.promptVisual,
        imageUrl,
      };

      cache.set(cacheKey, { value: result, expiresAt: currentTime + CACHE_TTL_MS });
      logger.info('Imagine generation completed', { size, cached: false });
      return result;
    } catch (error) {
      const status = typeof (error as { status?: number })?.status === 'number' ? (error as { status?: number }).status : undefined;
      logger.error('Imagine generation failed', {
        status,
        message: (error as Error)?.message ?? 'Unknown error',
      });
      throw error;
    }
  };

  return {
    generateImaginedDesign,
  };
};

export const imagineService = createImagineService();
