import { useCallback, useMemo, useRef, useState } from 'react';
import { buildApiUrl } from '@/utils/api';

export type ImagineStatus = 'idle' | 'loading' | 'success' | 'error';

export type ImagineSize = '1024x1024' | '1024x1536' | '1536x1024' | 'auto';

export interface ImagineData {
  textoInspirador: string;
  promptVisual: string;
  imageUrl: string | null;
  imageBase64?: string | null;
  /** Permite pedirle a Gemini un ajuste sobre esta misma imagen. */
  interactionId?: string | null;
}

export interface ImagineOpciones {
  /** Lote sobre el que se dibuja (1-13). */
  numeroLote?: number;
  /** Id de la imagen anterior: convierte la petición en un refinamiento. */
  previousInteractionId?: string;
}

interface ImagineResponse {
  ok: boolean;
  data?: ImagineData;
  error?: string;
  message?: string;
}

const buildImagineEndpoint = () => buildApiUrl('/api/imagine');

const sanitizePrompt = (value: string) => value.replace(/\s+/g, ' ').trim();

const allowedSizes: ImagineSize[] = ['1024x1024', '1024x1536', '1536x1024', 'auto'];
const allowedSizeSet = new Set<ImagineSize>(allowedSizes);

const resolveImageUrl = (value: string) => {
  if (value.startsWith('data:image')) {
    return value;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (value.startsWith('/')) {
    return buildApiUrl(value);
  }
  return value;
};

export const getImagineImageSrc = (data: Pick<ImagineData, 'imageUrl' | 'imageBase64'> | null) => {
  if (!data) return null;
  // El base64 va primero: la URL apunta al backend, que responde con
  // Cross-Origin-Resource-Policy: same-origin, así que el navegador bloquea esa imagen
  // al cargarla desde otro origen. Un data: URI no tiene ese problema.
  if (data.imageBase64) return `data:image/png;base64,${data.imageBase64}`;
  if (data.imageUrl) return resolveImageUrl(data.imageUrl);
  return null;
};

export const useImagine = () => {
  const [status, setStatus] = useState<ImagineStatus>('idle');
  const [result, setResult] = useState<ImagineData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const endpoint = useMemo(buildImagineEndpoint, []);

  const generate = useCallback(
    async (prompt: string, size: ImagineSize, opciones: ImagineOpciones = {}) => {
      const normalizedPrompt = sanitizePrompt(prompt);
      if (normalizedPrompt.length < 5) {
        setError('Describe tu idea con al menos 5 caracteres.');
        setStatus('error');
        return { ok: false } as const;
      }

      const safeSize = allowedSizeSet.has(size) ? size : '1024x1024';

      if (abortController.current) {
        abortController.current.abort();
      }

      const controller = new AbortController();
      abortController.current = controller;

      setStatus('loading');
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: normalizedPrompt,
            size: safeSize,
            numeroLote: opciones.numeroLote,
            previousInteractionId: opciones.previousInteractionId,
          }),
          signal: controller.signal,
        });

        let payload: ImagineResponse;
        try {
          payload = (await response.json()) as ImagineResponse;
        } catch {
          payload = { ok: false };
        }

        if (!response.ok || !payload.ok || !payload.data) {
          const errorCode = payload.error ?? 'IMAGE_GENERATION_FAILED';
          const apiMessage = payload.message;

          let friendlyMessage = 'No se pudo generar la imagen. Inténtalo de nuevo.';

          if (response.status === 429 && errorCode === 'OPENAI_QUOTA') {
            friendlyMessage = 'Se alcanzó el límite de uso. Intenta más tarde.';
          } else if (response.status === 429 && errorCode === 'RATE_LIMITED') {
            friendlyMessage = 'Has superado el límite de solicitudes. Intenta de nuevo en unos minutos.';
          } else if ((response.status === 504 || response.status === 502) && errorCode === 'OPENAI_UPSTREAM') {
            friendlyMessage = 'El servicio tardó demasiado. Intenta nuevamente.';
          } else if (response.status === 400 && errorCode === 'INVALID_PROMPT_OR_FORMAT') {
            friendlyMessage = 'No pudimos procesar tu descripción. Ajusta el texto e inténtalo de nuevo.';
          } else if (!response.ok && apiMessage) {
            friendlyMessage = apiMessage;
          }

          setError(friendlyMessage);
          setStatus('error');
          return { ok: false } as const;
        }

        setResult(payload.data);
        setStatus('success');
        return { ok: true, data: payload.data } as const;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return { ok: false } as const;
        }
        setError((prev) => prev ?? 'No se pudo generar la imagen. Inténtalo de nuevo.');
        setStatus('error');
        return { ok: false } as const;
      } finally {
        abortController.current = null;
      }
    },
    [endpoint],
  );

  /**
   * Pide un ajuste sobre la imagen que ya está en pantalla —«ponle más palmeras»— en vez
   * de generar una nueva desde cero. Necesita que la generación previa haya devuelto un
   * interactionId, que hoy solo entrega Gemini.
   */
  const refine = useCallback(
    async (instruccion: string, size: ImagineSize, numeroLote?: number) => {
      const anterior = result?.interactionId;
      if (!anterior) {
        setError('Primero genera una imagen para poder ajustarla.');
        setStatus('error');
        return { ok: false } as const;
      }
      return generate(instruccion, size, { numeroLote, previousInteractionId: anterior });
    },
    [generate, result],
  );

  const puedeRefinar = Boolean(result?.interactionId);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  return {
    status,
    result,
    error,
    generate,
    refine,
    puedeRefinar,
    reset,
  };
};

export const imagineSizes: ImagineSize[] = allowedSizes;

export const normalizeImaginePrompt = sanitizePrompt;
