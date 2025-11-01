import type { Request, Response } from 'express';
import { z } from 'zod';
import { chatbotService } from '../services/chatbot.service';
import { OpenAIRequestError } from '../services/openai.request';
import { logger } from '../utils/logger';

const messageSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .max(10)
    .optional(),
});

export const chatWithAssistant = async (req: Request, res: Response) => {
  const parsed = messageSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    logger.warn('Chatbot input validation failed', { issues: parsed.error.issues.length });
    return res.status(400).json({
      ok: false,
      error: 'INVALID_INPUT',
      message: 'Envía un mensaje válido para continuar la conversación.',
    });
  }

  const { message, history } = parsed.data;

  try {
    const response = await chatbotService.chat({ message, history });
    return res.status(200).json({ ok: true, data: response });
  } catch (error) {
    if (error instanceof OpenAIRequestError) {
      const { status, errorCode } = error;
      if (errorCode === 'INVALID_PROMPT_OR_FORMAT') {
        return res.status(400).json({
          ok: false,
          error: 'INVALID_PROMPT_OR_FORMAT',
          message: error.message,
        });
      }

      if (errorCode === 'OPENAI_AUTH') {
        return res.status(401).json({ ok: false, error: 'OPENAI_AUTH', message: error.message });
      }

      if (errorCode === 'OPENAI_QUOTA') {
        const quotaStatus = status === 402 ? 402 : 429;
        return res.status(quotaStatus).json({ ok: false, error: 'OPENAI_QUOTA', message: error.message });
      }

      const upstreamStatus = status === 504 ? 504 : 502;
      return res.status(upstreamStatus).json({ ok: false, error: 'OPENAI_UPSTREAM', message: error.message });
    }

    logger.error('Chatbot request failed', {
      message: (error as Error)?.message ?? 'Unknown error',
    });

    return res.status(500).json({
      ok: false,
      error: 'CHATBOT_ERROR',
      message: 'No se pudo procesar tu mensaje. Intenta de nuevo más tarde.',
    });
  }
};
