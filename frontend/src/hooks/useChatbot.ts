import { useCallback, useMemo, useState } from 'react';
import { buildApiUrl } from '@/utils/api';

export type ChatbotStatus = 'idle' | 'loading';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotResponse {
  ok: boolean;
  data?: {
    reply: string;
  };
  error?: string;
  message?: string;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: createId(),
      role: 'assistant',
      content: 'Hola, soy tu asistente virtual de Gran Dzilam. ¿En qué puedo ayudarte con la compra de tu lote?',
    },
  ]);
  const [status, setStatus] = useState<ChatbotStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => buildApiUrl('/api/chatbot'), []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || status === 'loading') {
        return;
      }

      const historyPayload = messages.slice(-10).map(({ role, content: historyContent }) => ({
        role,
        content: historyContent,
      }));

      const newUserMessage: ChatMessage = {
        id: createId(),
        role: 'user',
        content: trimmed,
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setStatus('loading');
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history: historyPayload }),
        });

        let payload: ChatbotResponse;
        try {
          payload = (await response.json()) as ChatbotResponse;
        } catch {
          payload = { ok: false };
        }

        if (!response.ok || !payload.ok || !payload.data) {
          const errorCode = payload.error ?? 'CHATBOT_ERROR';
          const apiMessage = payload.message;

          let friendly = 'No pude responder en este momento. Intenta de nuevo más tarde.';
          if (response.status === 429 && errorCode === 'OPENAI_QUOTA') {
            friendly = 'Se alcanzó el límite de uso. Intenta más tarde.';
          } else if (response.status === 429 && errorCode === 'RATE_LIMITED') {
            friendly = 'Has superado el límite de solicitudes. Intenta de nuevo en unos minutos.';
          } else if ((response.status === 504 || response.status === 502) && errorCode === 'OPENAI_UPSTREAM') {
            friendly = 'El servicio tardó demasiado. Intenta nuevamente.';
          } else if (response.status === 400 && errorCode === 'INVALID_PROMPT_OR_FORMAT') {
            friendly = 'No pudimos procesar tu mensaje. Ajusta el texto e inténtalo de nuevo.';
          } else if (!response.ok && apiMessage) {
            friendly = apiMessage;
          }

          setError(friendly);
          return;
        }

        const assistantMessage: ChatMessage = {
          id: createId(),
          role: 'assistant',
          content: payload.data.reply,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError('No pude responder en este momento. Intenta de nuevo más tarde.');
      } finally {
        setStatus('idle');
      }
    },
    [endpoint, messages, status],
  );

  const reset = useCallback(() => {
    setMessages([
      {
        id: createId(),
        role: 'assistant',
        content: 'Hola, soy tu asistente virtual de Gran Dzilam. ¿En qué puedo ayudarte con la compra de tu lote?',
      },
    ]);
    setError(null);
    setStatus('idle');
  }, []);

  return {
    messages,
    status,
    error,
    sendMessage,
    reset,
  };
};
