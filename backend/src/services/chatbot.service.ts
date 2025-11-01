import { loadEnv } from '../config/env';
import { logger } from '../utils/logger';
import { requestOpenAI } from './openai.request';

type ChatRole = 'user' | 'assistant';

export interface ChatbotMessage {
  role: ChatRole;
  content: string;
}

export interface ChatbotRequest {
  message: string;
  history?: ChatbotMessage[];
}

export interface ChatbotResponse {
  reply: string;
}

interface ChatbotServiceDependencies {
  fetchImpl?: typeof fetch;
  apiKey?: string | null;
  useMock?: boolean;
}

const MODEL = 'gpt-4o-mini';
const CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const MAX_HISTORY = 10;

const sanitizeHistory = (history: ChatbotMessage[] | undefined): ChatbotMessage[] => {
  if (!Array.isArray(history)) {
    return [];
  }

  const cleaned = history
    .filter((entry) => entry && typeof entry.content === 'string' && (entry.role === 'user' || entry.role === 'assistant'))
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim().slice(0, 1000),
    }));

  if (cleaned.length <= MAX_HISTORY) {
    return cleaned;
  }

  return cleaned.slice(cleaned.length - MAX_HISTORY);
};

export const createChatbotService = (deps: ChatbotServiceDependencies = {}) => {
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

  const chat = async ({ message, history }: ChatbotRequest): Promise<ChatbotResponse> => {
    const trimmedMessage = message.trim();
    const sanitizedHistory = sanitizeHistory(history);

    if (useMock) {
      const reply =
        '¡Hola! Estoy aquí para ayudarte con la compra de lotes en Gran Dzilam. Cuéntame qué tipo de lote buscas o cuáles son tus dudas.';
      return { reply };
    }

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing');
    }

    const messages = [
      {
        role: 'system' as const,
        content:
          'Eres un asesor inmobiliario de Gran Dzilam. Responde en español con información útil sobre disponibilidad, beneficios y pasos para comprar lotes. Sé claro, conciso y amable.',
      },
      ...sanitizedHistory.map((entry) => ({ role: entry.role, content: entry.content })),
      { role: 'user' as const, content: trimmedMessage },
    ];

    const response = await requestOpenAI<any>({
      fetchImpl,
      url: CHAT_URL,
      apiKey,
      timeoutMs: 30000,
      body: {
        model: MODEL,
        messages,
        temperature: 0.6,
        max_tokens: 280,
      },
    });

    const reply = response?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      logger.warn('Chatbot response missing content');
      return {
        reply:
          'No pude obtener una respuesta en este momento. Intenta de nuevo o consulta con un asesor humano de Gran Dzilam.',
      };
    }

    return { reply };
  };

  return { chat };
};

export const chatbotService = createChatbotService();
