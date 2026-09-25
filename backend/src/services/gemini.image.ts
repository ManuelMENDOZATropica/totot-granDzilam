import { logger } from '../utils/logger';

/**
 * Cliente de imagen de Gemini (la familia «Nano Banana»).
 *
 * A diferencia de la API de imágenes de OpenAI, esta acepta imágenes de entrada, así que
 * sirve para EDITAR la ortofoto real del lote en vez de inventar un terreno desde cero.
 * Endpoint: POST /v1beta/interactions con la llave en la cabecera x-goog-api-key.
 */

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

export type GeminiImageModel =
  | 'gemini-3.1-flash-image'
  | 'gemini-3-pro-image'
  | 'gemini-3.1-flash-lite-image';

export type GeminiAspectRatio = '1:1' | '3:2' | '2:3' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';
export type GeminiImageSize = '1K' | '2K' | '4K';

export type GeminiErrorCode = 'GEMINI_AUTH' | 'GEMINI_QUOTA' | 'GEMINI_BLOCKED' | 'GEMINI_UPSTREAM';

export class GeminiImageError extends Error {
  constructor(
    public readonly errorCode: GeminiErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'GeminiImageError';
  }
}

export interface ImagenReferencia {
  /** base64 sin el prefijo data: */
  data: string;
  mimeType: 'image/png' | 'image/jpeg';
}

export interface GeminiImageRequest {
  prompt: string;
  /** Hasta 14. Si va vacío es generación desde texto; si no, es edición. */
  referencias?: ImagenReferencia[];
  model?: GeminiImageModel;
  aspectRatio?: GeminiAspectRatio;
  imageSize?: GeminiImageSize;
  /** Encadena sobre un resultado anterior para refinarlo sin empezar de cero. */
  previousInteractionId?: string;
  timeoutMs?: number;
}

export interface GeminiImageResult {
  /** base64 de la imagen resultante, sin prefijo. */
  data: string;
  mimeType: string;
  interactionId?: string;
}

const MAX_REFERENCIAS = 14;

const clasificar = (status: number, cuerpo: string): GeminiErrorCode => {
  if (status === 401 || status === 403) return 'GEMINI_AUTH';
  if (status === 429) return 'GEMINI_QUOTA';
  if (status === 400 && /safety|blocked|policy/i.test(cuerpo)) return 'GEMINI_BLOCKED';
  return 'GEMINI_UPSTREAM';
};

export const createGeminiImageClient = (opts: { apiKey: string; fetchImpl?: typeof fetch }) => {
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) throw new Error('Fetch implementation is required');

  const generar = async (req: GeminiImageRequest): Promise<GeminiImageResult> => {
    const referencias = (req.referencias ?? []).slice(0, MAX_REFERENCIAS);
    if ((req.referencias?.length ?? 0) > MAX_REFERENCIAS) {
      logger.warn('Se recortaron las imágenes de referencia', {
        recibidas: req.referencias?.length,
        maximo: MAX_REFERENCIAS,
      });
    }

    const body: Record<string, unknown> = {
      model: req.model ?? 'gemini-3.1-flash-image',
      input: [
        { type: 'text', text: req.prompt },
        ...referencias.map((r) => ({ type: 'image', mime_type: r.mimeType, data: r.data })),
      ],
      response_format: {
        type: 'image',
        mime_type: 'image/jpeg',
        aspect_ratio: req.aspectRatio ?? '21:9',
        image_size: req.imageSize ?? '2K',
      },
    };
    if (req.previousInteractionId) body.previous_interaction_id = req.previousInteractionId;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), req.timeoutMs ?? 90000);

    let res: Response;
    try {
      res = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': opts.apiKey },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timer);
      const abortado = (error as Error)?.name === 'AbortError';
      throw new GeminiImageError('GEMINI_UPSTREAM', abortado ? 'Gemini tardó demasiado en responder' : 'No se pudo contactar a Gemini');
    }
    clearTimeout(timer);

    const texto = await res.text();
    if (!res.ok) {
      const code = clasificar(res.status, texto);
      logger.error('Gemini rechazó la petición de imagen', { status: res.status, code });
      throw new GeminiImageError(code, `Gemini respondió ${res.status}`, res.status);
    }

    let json: any;
    try {
      json = JSON.parse(texto);
    } catch {
      throw new GeminiImageError('GEMINI_UPSTREAM', 'Gemini devolvió una respuesta que no es JSON');
    }

    // La respuesta es la interacción en la raíz, con los resultados repartidos en `steps`.
    // El primer paso suele ser un `thought`; la imagen llega en un paso `model_output`,
    // dentro de `content`. Se recorre todo en vez de asumir posiciones fijas porque el
    // número de pasos varía según el modelo y el prompt.
    const salida = (json?.steps ?? [])
      .flatMap((paso: any) => paso?.content ?? [])
      .find((parte: any) => parte?.type === 'image' && typeof parte?.data === 'string');

    if (!salida) {
      const tipos = (json?.steps ?? []).map((p: any) => p?.type).join(', ') || 'ninguno';
      logger.error('Gemini respondió sin imagen', { status: json?.status, pasos: tipos });
      throw new GeminiImageError(
        json?.status === 'blocked' ? 'GEMINI_BLOCKED' : 'GEMINI_UPSTREAM',
        'Gemini no devolvió ninguna imagen',
      );
    }

    return {
      data: salida.data,
      mimeType: salida.mime_type ?? 'image/jpeg',
      interactionId: json?.id,
    };
  };

  return { generar };
};

export type GeminiImageClient = ReturnType<typeof createGeminiImageClient>;
