import { loadEnv } from '../config/env';
import { logger } from '../utils/logger';
import { buildCacheKey } from '../utils/prompt';
import { requestOpenAI } from './openai.request';
import fs from 'fs';
import path from 'path';

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

const resolveAssetPath = (fileName: string) => {
  const candidates = [
    path.join(process.cwd(), 'src', 'IA', fileName),
    path.join(__dirname, '..', 'IA', fileName),
    path.join(__dirname, 'IA', fileName),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(`Unable to locate IA asset: ${fileName}`);
  }

  return found;
};

const MASTER_PROMPT_PATH = resolveAssetPath('masterPrompt.txt');
const MASTER_IMAGE_PATH = resolveAssetPath('1.png');

let cachedMasterPrompt: string | null = null;
let cachedBaseImage: string | null = null;

const loadMasterPrompt = () => {
  if (cachedMasterPrompt) return cachedMasterPrompt;

  const buffer = fs.readFileSync(MASTER_PROMPT_PATH);
  cachedMasterPrompt = buffer.toString();
  return cachedMasterPrompt;
};

const loadBaseImage = () => {
  if (cachedBaseImage) return cachedBaseImage;

  const buffer = fs.readFileSync(MASTER_IMAGE_PATH);
  cachedBaseImage = buffer.toString('base64');
  return cachedBaseImage;
};

const buildObjective = (idea: string) => {
  const cleanIdea = idea.trim();
  if (!cleanIdea) {
    return 'un mega proyecto urbano costero de uso mixto con énfasis en vivienda y recreación';
  }

  const ideaLower = cleanIdea.toLowerCase();
  if (ideaLower.includes('casa') || ideaLower.split(' ').length <= 3) {
    return `un complejo habitacional a gran escala inspirado en ${cleanIdea}, con múltiples torres residenciales, amenidades y vialidades internas`;
  }

  return `un master plan amplio que expande la idea de ${cleanIdea} hacia un desarrollo metropolitano con zonas residenciales, comerciales y corredores verdes`;
};

const buildImagePrompt = (idea: string) => {
  const template = loadMasterPrompt();
  const objective = buildObjective(idea);
  return template.replace(/\[\[objetive\]\]/gi, objective);
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
      const promptForImage = buildImagePrompt(payload.prompt);
      const textoInspirador = `Visualiza ${buildObjective(payload.prompt)} en Gran Dzilam, con vialidades internas, autos diminutos y arquitectura adaptada a la franja de terreno.`;

      const imageResponse = await requestOpenAI<any>({
        fetchImpl,
        url: IMAGE_URL,
        apiKey,
        timeoutMs: 30000,
        body: {
          model: IMAGE_MODEL,
          prompt: promptForImage,
          image: loadBaseImage(),
          size,
        },
      });

      const imageUrl = resolveImageUrl(imageResponse);

      const result: ImagineResult = {
        textoInspirador,
        promptVisual: promptForImage,
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
