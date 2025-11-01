import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type ImagineStatus = 'idle' | 'loading' | 'success' | 'error';

export type ImagineSize = '1024x1024' | '768x768' | '512x512';

export interface ImagineData {
  textoInspirador: string;
  promptVisual: string;
  imageUrl: string | null;
}

interface ImagineResponse {
  ok: boolean;
  data?: ImagineData;
  error?: string;
}

const buildImagineEndpoint = () => {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
  return base ? `${base}/api/imagine` : '/api/imagine';
};

const LAST_PROMPT_KEY = 'gran-dzilam-imagine:last-prompt';

const sanitizePrompt = (value: string) => value.replace(/\s+/g, ' ').trim();

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
          body: JSON.stringify({ prompt: normalizedPrompt, size }),
          signal: controller.signal,
        });

        let payload: ImagineResponse;
        try {
          payload = (await response.json()) as ImagineResponse;
        } catch {
          payload = { ok: false };
        }

        if (!response.ok || !payload.ok || !payload.data) {
          throw new Error(payload.error ?? 'IMAGE_GENERATION_FAILED');
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
        setError('No se pudo generar la imagen. Inténtalo de nuevo.');
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

export const imagineSizes: ImagineSize[] = ['1024x1024', '768x768', '512x512'];

export const normalizeImaginePrompt = sanitizePrompt;
