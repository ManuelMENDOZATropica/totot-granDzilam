import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildApiUrl } from '@/utils/api';

export type ImagineStatus = 'idle' | 'loading' | 'success' | 'error';

export type ImagineSize = '1024x1024' | '1024x1536' | '1536x1024' | 'auto';

export interface ImagineData {
  textoInspirador: string;
  promptVisual: string;
  imageUrl: string | null;
}

interface ImagineResponse {
  ok: boolean;
  data?: ImagineData;
  error?: string;
  message?: string;
}

const buildImagineEndpoint = () => buildApiUrl('/api/imagine');

const LAST_PROMPT_KEY = 'gran-dzilam-imagine:last-prompt';

const sanitizePrompt = (value: string) => value.replace(/\s+/g, ' ').trim();

const allowedSizes: ImagineSize[] = ['1024x1024', '1024x1536', '1536x1024', 'auto'];
const allowedSizeSet = new Set<ImagineSize>(allowedSizes);

export const useImagine = () => {
  const [status, setStatus] = useState<ImagineStatus>('idle');
  const [result, setResult] = useState<ImagineData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(LAST_PROMPT_KEY);
    if (stored) {
      setLastPrompt(stored);
    }
  }, []);

  const endpoint = useMemo(buildImagineEndpoint, []);

  const generate = useCallback(
    async (prompt: string, size: ImagineSize) => {
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
          body: JSON.stringify({ prompt: normalizedPrompt, size: safeSize }),
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
        setLastPrompt(normalizedPrompt);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(LAST_PROMPT_KEY, normalizedPrompt);
        }

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

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  return {
    status,
    result,
    error,
    lastPrompt,
    generate,
    reset,
  };
};

export const imagineSizes: ImagineSize[] = allowedSizes;

export const normalizeImaginePrompt = sanitizePrompt;
