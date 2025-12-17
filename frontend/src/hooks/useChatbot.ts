import { useCallback, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  // CAMBIO IMPORTANTE: Iniciamos con array vacío para que el Widget
  // muestre la UI de bienvenida con las sugerencias.
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [status, setStatus] = useState<ChatbotStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const { language, translations } = useLanguage();
  const errorMessages = translations.chatbot.errors;
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
          body: JSON.stringify({ message: trimmed, history: historyPayload, language }),
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

          let friendly = errorMessages.generic;
          if (response.status === 429 && errorCode === 'OPENAI_QUOTA') {
            friendly = errorMessages.quota;
          } else if (response.status === 429 && errorCode === 'RATE_LIMITED') {
            friendly = errorMessages.rateLimited;
          } else if ((response.status === 504 || response.status === 502) && errorCode === 'OPENAI_UPSTREAM') {
            friendly = errorMessages.timeout;
          } else if (response.status === 400 && errorCode === 'INVALID_PROMPT_OR_FORMAT') {
            friendly = errorMessages.invalidPrompt;
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
        setError(errorMessages.generic);
      } finally {
        setStatus('idle');
      }
    },
    [endpoint, errorMessages.generic, errorMessages.invalidPrompt, errorMessages.quota, errorMessages.rateLimited, errorMessages.timeout, language, messages, status],
  );

  const reset = useCallback(() => {
    // Reseteamos a vacío para volver a mostrar las sugerencias
    setMessages([]);
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