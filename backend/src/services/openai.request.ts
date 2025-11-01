import { logger } from '../utils/logger';

export type OpenAIErrorCode =
  | 'INVALID_PROMPT_OR_FORMAT'
  | 'OPENAI_QUOTA'
  | 'OPENAI_AUTH'
  | 'OPENAI_UPSTREAM';

export class OpenAIRequestError extends Error {
  status?: number;
  type?: string;
  code?: string;
  errorCode: OpenAIErrorCode;

  constructor(message: string, options: { status?: number; type?: string; code?: string; errorCode: OpenAIErrorCode }) {
    super(message);
    this.name = 'OpenAIRequestError';
    this.status = options.status;
    this.type = options.type;
    this.code = options.code;
    this.errorCode = options.errorCode;
  }
}

interface RequestOptions {
  fetchImpl: typeof fetch;
  url: string;
  apiKey: string;
  body: unknown;
  timeoutMs: number;
  maxAttempts?: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryStatus = (status?: number) => status === 408 || (typeof status === 'number' && status >= 500 && status < 600);

export const requestOpenAI = async <T>({
  fetchImpl,
  url,
  apiKey,
  body,
  timeoutMs,
  maxAttempts = 2,
}: RequestOptions): Promise<T> => {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    attempt += 1;
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

        const messageFromApi =
          parsedBody?.error?.message ?? parsedBody?.message ?? `OpenAI request failed with status ${response.status}`;
        const errorType = parsedBody?.error?.type ?? parsedBody?.type;
        const errorCode = parsedBody?.error?.code ?? parsedBody?.code;

        let mappedError: OpenAIErrorCode = 'OPENAI_UPSTREAM';
        if (response.status === 400 && errorType === 'invalid_request_error') {
          mappedError = 'INVALID_PROMPT_OR_FORMAT';
        } else if (response.status === 401) {
          mappedError = 'OPENAI_AUTH';
        } else if (response.status === 402 || response.status === 429) {
          mappedError = 'OPENAI_QUOTA';
        }

        logger.error('OpenAI request failed', {
          status: response.status,
          message: messageFromApi,
          type: errorType,
          code: errorCode,
        });

        const apiError = new OpenAIRequestError(messageFromApi, {
          status: response.status,
          type: errorType,
          code: errorCode,
          errorCode: mappedError,
        });

        if (shouldRetryStatus(response.status) && attempt < maxAttempts) {
          const backoff = Math.pow(2, attempt - 1) * 300;
          await delay(backoff);
          continue;
        }

        throw apiError;
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;

      if (error instanceof OpenAIRequestError) {
        if (shouldRetryStatus(error.status) && attempt < maxAttempts) {
          const backoff = Math.pow(2, attempt - 1) * 300;
          await delay(backoff);
          continue;
        }
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

        if (attempt < maxAttempts) {
          const backoff = Math.pow(2, attempt - 1) * 300;
          await delay(backoff);
          continue;
        }

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

      if (attempt < maxAttempts) {
        const backoff = Math.pow(2, attempt - 1) * 300;
        await delay(backoff);
        continue;
      }

      throw networkError;
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error('OpenAI request failed');
};
