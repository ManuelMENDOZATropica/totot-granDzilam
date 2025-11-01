import { loadEnv } from '../config/env';
import { logger } from '../utils/logger';
import { buildCacheKey } from '../utils/prompt';

export type ImagineImageSize = '1024x1024' | '768x768' | '512x512';

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
const CACHE_TTL_MS = 5 * 60 * 1000;
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

export type ImagineServiceErrorCode =
  | 'INVALID_PROMPT_OR_FORMAT'
  | 'OPENAI_QUOTA'
  | 'OPENAI_AUTH'
  | 'OPENAI_UPSTREAM';

export class OpenAIRequestError extends Error {
  status?: number;
  type?: string;
  code?: string;
  errorCode: ImagineServiceErrorCode;

  constructor(message: string, options: { status?: number; type?: string; code?: string; errorCode: ImagineServiceErrorCode }) {
    super(message);
    this.name = 'OpenAIRequestError';
    this.status = options.status;
    this.type = options.type;
    this.code = options.code;
    this.errorCode = options.errorCode;
  }
}

const requestWithTimeout = async <T>(
  fetchImpl: typeof fetch,
  url: string,
  apiKey: string,
  body: unknown,
  timeoutMs: number,
): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(errorBody);
      } catch (parseError) {
        parsedBody = null;
      }

      const messageFromApi = parsedBody?.error?.message ?? parsedBody?.message ?? `OpenAI request failed with status ${response.status}`;
      const errorType = parsedBody?.error?.type ?? parsedBody?.type;
      const errorCode = parsedBody?.error?.code ?? parsedBody?.code;

      let imagineErrorCode: ImagineServiceErrorCode = 'OPENAI_UPSTREAM';
      if (response.status === 400 && errorType === 'invalid_request_error') {
        imagineErrorCode = 'INVALID_PROMPT_OR_FORMAT';
      } else if (response.status === 401) {
        imagineErrorCode = 'OPENAI_AUTH';
      } else if (response.status === 402 || response.status === 429) {
        imagineErrorCode = 'OPENAI_QUOTA';
      }

      logger.error('OpenAI request failed', {
        status: response.status,
        message: messageFromApi,
        type: errorType,
        code: errorCode,
      });

      throw new OpenAIRequestError(messageFromApi, {
        status: response.status,
        type: errorType,
        code: errorCode,
        errorCode: imagineErrorCode,
      });
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof OpenAIRequestError) {
      throw error;
    }

    if ((error as Error)?.name === 'AbortError') {
      const timeoutError = new OpenAIRequestError('Request to OpenAI timed out', {
        status: 504,
        type: 'timeout',
        code: 'timeout',
        errorCode: 'OPENAI_UPSTREAM',
      });
      logger.error('OpenAI request timed out', { status: 504, message: timeoutError.message });
      throw timeoutError;
    }

    const networkMessage = (error as Error)?.message ?? 'Failed to reach OpenAI';
    const networkError = new OpenAIRequestError(networkMessage, {
      status: 502,
      type: 'network_error',
      code: 'network_error',
      errorCode: 'OPENAI_UPSTREAM',
    });
    logger.error('OpenAI request encountered a network error', { status: 502, message: networkMessage });
    throw networkError;
  } finally {
    clearTimeout(timer);
  }
};

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
      logger.info('Imagine cache hit', { size });
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
      return mockResult;
    }

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing');
    }

    try {
      const chatResponse = await requestWithTimeout<any>(
        fetchImpl,
        CHAT_URL,
        apiKey,
        {
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
          response_format: { type: 'json_object' },
        },
        20000,
      );

      const content = chatResponse?.choices?.[0]?.message?.content ?? '';
      const parsed = parseImagineResponse(content);

      const imageResponse = await requestWithTimeout<any>(
        fetchImpl,
        IMAGE_URL,
        apiKey,
        {
          model: IMAGE_MODEL,
          prompt: parsed.promptVisual,
          size,
        },
        25000,
      );

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
