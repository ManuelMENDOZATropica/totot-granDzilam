import fs from 'fs';
import path from 'path';
import { loadEnv } from '../config/env';
import { logger } from '../utils/logger';
import { buildCacheKey } from '../utils/prompt';
import { requestOpenAI } from './openai.request';
import { ImagineImageModel } from '../models/imagine-image.model';
import type { ImagineImageSize as ImagineImageSizeType, ImagineResult as ImagineResultType } from '../types/imagine';

export type ImagineImageSize = ImagineImageSizeType;

export interface ImagineRequestPayload {
  prompt: string;
  size?: ImagineImageSize;
}

export type ImagineResult = ImagineResultType;

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
  resultsDir?: string;
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

const IMAGE_PROMPT_PATH = resolveAssetPath('promptImagen.txt');

let cachedImagePrompt: string | null = null;

const loadImagePromptTemplate = () => {
  if (cachedImagePrompt) return cachedImagePrompt;

  const buffer = fs.readFileSync(IMAGE_PROMPT_PATH);
  cachedImagePrompt = buffer.toString();
  return cachedImagePrompt;
};

const buildObjective = (idea: string) => {
  const cleanIdea = idea.trim();
  if (!cleanIdea) {
    return 'un master plan de 8 hectáreas con usos mixtos, plazas activas, vialidades y parques arbolados que conectan todo el predio';
  }

  const ideaLower = cleanIdea.toLowerCase();
  const isCompactIdea = ideaLower.split(/\s+/).length <= 4;
  const mentionsSports = /(fútbol|futbol|soccer|cancha|estadio|deporte)/i.test(cleanIdea);

  if (mentionsSports) {
    return `un distrito deportivo de 8 hectáreas inspirado en ${cleanIdea}, con múltiples canchas, complejos de entrenamiento, graderíos, plazas públicas, vivienda y áreas verdes interconectadas`;
  }

  if (isCompactIdea || ideaLower.includes('casa') || ideaLower.includes('cabaña') || ideaLower.includes('kiosco')) {
    return `un mega proyecto de 8 hectáreas inspirado en ${cleanIdea}, ampliado con torres residenciales, zonas comerciales, parques lineales, estacionamientos y vialidades para que la idea se sienta como un desarrollo integral`;
  }

  return `un master plan de 8 hectáreas que lleva ${cleanIdea} a escala urbana con barrios, equipamiento comunitario, movilidad peatonal, plazas y franjas arboladas`;
};

const buildImagePrompt = (idea: string) => {
  const template = loadImagePromptTemplate();
  const concept = idea.trim() || 'un master plan de 8 hectáreas con usos mixtos y plazas arboladas';

  return template.replace(/“?\{CONCEPTO\}”?/gi, concept);
};

const cleanBase64 = (value: string) => (value.includes(',') ? value.split(',', 2)[1] ?? value : value);

const ensureResultsDir = (resultsDir: string) => {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
};

const saveImageToResults = (resultsDir: string, base64Image: string) => {
  ensureResultsDir(resultsDir);
  const fileName = `imagine-${Date.now()}-${Math.round(Math.random() * 1_000_000)}.png`;
  const filePath = path.join(resultsDir, fileName);
  const buffer = Buffer.from(cleanBase64(base64Image), 'base64');
  fs.writeFileSync(filePath, buffer);
  return `/IA/resultados/${fileName}`;
};

interface ResolvedImage {
  url: string | null;
  base64?: string | null;
}

const resolveImageAsset = (data: any, resultsDir: string): ResolvedImage => {
  const asset = Array.isArray(data?.data) ? data.data[0] : undefined;
  if (!asset) {
    return { url: null, base64: null };
  }

  if (typeof asset.b64_json === 'string' && asset.b64_json.length > 0) {
    const url = saveImageToResults(resultsDir, asset.b64_json);
    return { url, base64: cleanBase64(asset.b64_json) };
  }

  if (typeof asset.url === 'string' && asset.url.length > 0) {
    if (asset.url.startsWith('data:image')) {
      const url = saveImageToResults(resultsDir, asset.url);
      return { url, base64: cleanBase64(asset.url) };
    }
    return { url: asset.url, base64: null };
  }

  return { url: null, base64: null };
};

export type ImagineServiceErrorCode = 'INVALID_PROMPT_OR_FORMAT' | 'OPENAI_QUOTA' | 'OPENAI_AUTH' | 'OPENAI_UPSTREAM';

const persistImagineImage = async (
  payload: ImagineRequestPayload,
  result: ImagineResult,
  size: ImagineImageSize,
  base64Image?: string | null,
) => {
  try {
    const document = await ImagineImageModel.create({
      prompt: payload.prompt.trim(),
      promptVisual: result.promptVisual,
      textoInspirador: result.textoInspirador,
      imageUrl: result.imageUrl ?? '',
      imageBase64: base64Image ?? null,
      size,
    });

    return document.id;
  } catch (error) {
    logger.warn('Failed to persist imagine image', { message: (error as Error)?.message ?? 'Unknown error' });
    return null;
  }
};

export const createImagineService = (deps: ImagineServiceDependencies = {}) => {
  const cache = deps.cache ?? new Map<string, CacheEntry>();
  const now = deps.now ?? Date.now;
  const env = loadEnv();
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  const resultsDir = deps.resultsDir ?? path.join(process.cwd(), 'public', 'IA', 'resultados');

  if (!fetchImpl) {
    throw new Error('Fetch implementation is required');
  }

  const envMock = env.USE_MOCK_OPENAI;
  const useMock = deps.useMock ?? (typeof envMock === 'string' ? envMock === 'true' || envMock === '1' : false);
  const timeoutMs = Number.isFinite(env.OPENAI_TIMEOUT_MS) ? Number(env.OPENAI_TIMEOUT_MS) : 45000;
  const maxAttempts = Number.isFinite(env.OPENAI_MAX_ATTEMPTS) ? Number(env.OPENAI_MAX_ATTEMPTS) : 3;

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

      void persistImagineImage(payload, mockResult, size, null);
      cache.set(cacheKey, { value: mockResult, expiresAt: currentTime + CACHE_TTL_MS });
      logger.info('Imagine generation completed', { size, cached: false });
      return mockResult;
    }

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing');
    }

    try {
      const objective = buildObjective(payload.prompt);
      const promptForImage = buildImagePrompt(payload.prompt);
      const textoInspirador = `Visualiza ${objective} en Gran Dzilam como un trazo visto desde dron, con vialidades internas, autos diminutos, arquitectura compacta y el resto del terreno intacto fuera de la zona transparente.`;

      const imageResponse = await requestOpenAI<any>({
        fetchImpl,
        url: IMAGE_URL,
        apiKey,
        timeoutMs,
        maxAttempts,
        body: {
          model: IMAGE_MODEL,
          prompt: promptForImage,
          size,
        },
      });

      const resolvedImage = resolveImageAsset(imageResponse, resultsDir);

      const result: ImagineResult = {
        textoInspirador,
        promptVisual: promptForImage,
        imageUrl: resolvedImage.url,
        imageBase64: resolvedImage.base64 ?? null,
      };

      cache.set(cacheKey, { value: result, expiresAt: currentTime + CACHE_TTL_MS });
      const imageId = await persistImagineImage(payload, result, size, resolvedImage.base64);
      if (imageId) {
        result.imageId = imageId;
      }
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
