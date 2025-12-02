import fs from 'fs';
import path from 'path';
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
const IMAGE_MODEL = 'gpt-image-1';
const IMAGE_URL = 'https://api.openai.com/v1/images/generations';
const IA_ASSETS_PATH = path.resolve(process.cwd(), '..', 'frontend', 'public', 'IA');
const MASTER_PROMPT_PATH = path.join(IA_ASSETS_PATH, 'masterPrompt.txt');
const MASTER_IMAGE_PATH = path.join(IA_ASSETS_PATH, '1.png');

const replaceObjective = (template: string, objective: string) =>
  template.replace(/\[\[(?:objetivo|objetive)\]\]/gi, objective);

const enhanceObjective = (idea: string) => {
  const normalized = idea.trim();
  if (!normalized) return 'un complejo habitacional visionario';

  const scaleKeywords = ['complejo', 'desarrollo', 'master plan', 'macro', 'habitacional'];
  const containsScale = scaleKeywords.some((keyword) => normalized.toLowerCase().includes(keyword));

  if (containsScale) {
    return normalized;
  }

  if (normalized.length < 20) {
    return `un complejo habitacional inspirado en ${normalized}, con torres, amenidades y urbanización completa`;
  }

  return `${normalized} evolucionado a un gran desarrollo tipo master plan con múltiples etapas y amenidades a escala urbana`;
};

const loadMasterPrompt = () => {
  try {
    const content = fs.readFileSync(MASTER_PROMPT_PATH, 'utf8');
    return content.trim();
  } catch (error) {
    logger.error('Failed to load master prompt template', error);
    return 'Genera una vista aérea de [[Objetivo]] con estilo fotorrealista.';
  }
};

const loadBaseImage = () => {
  try {
    const buffer = fs.readFileSync(MASTER_IMAGE_PATH);
    return buffer.toString('base64');
  } catch (error) {
    logger.error('Failed to load base imagine image', error);
    return null;
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
    const currentTime = now();

    const enhancedObjective = enhanceObjective(payload.prompt);
    const template = loadMasterPrompt();
    const promptVisual = replaceObjective(template, enhancedObjective);
    const cacheKey = buildCacheKey(promptVisual, size);
    const cached = cache.get(cacheKey);

    if (cached && cached.expiresAt > currentTime) {
      logger.info('Imagine generation completed', { size, cached: true });
      return cached.value;
    }

    const baseImage = loadBaseImage();

    if (useMock) {
      const mockResult: ImagineResult = {
        textoInspirador: `Plan maestro para ${enhancedObjective}`,
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
      const imageResponse = await requestOpenAI<any>({
        fetchImpl,
        url: IMAGE_URL,
        apiKey,
        timeoutMs: 30000,
        body: {
          model: IMAGE_MODEL,
          prompt: promptVisual,
          size,
          image: baseImage ?? undefined,
        },
      });

      const imageUrl = resolveImageUrl(imageResponse);

      const result: ImagineResult = {
        textoInspirador: `Plan maestro: ${enhancedObjective}`,
        promptVisual,
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
