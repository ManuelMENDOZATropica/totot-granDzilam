import type { Request, Response } from 'express';
import { z } from 'zod';
import { imagineService } from '../services/imagine.service';
import type { ImagineServiceErrorCode } from '../services/imagine.service';
import { sanitizePrompt, isPromptAllowed } from '../utils/prompt';
import { logger } from '../utils/logger';

const imagineSchema = z.object({
  prompt: z.string().min(5).max(400),
  size: z.enum(['1024x1024', '768x768', '512x512']).optional(),
});

const SIZE_MAP: Record<string, '1024x1024' | '768x768' | '512x512'> = {
  '1024x1024': '1024x1024',
  '768x768': '768x768',
  '512x512': '512x512',
};

const normalizeSize = (value: unknown): '1024x1024' | '768x768' | '512x512' | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const key = value.trim().toLowerCase();
  return SIZE_MAP[key as keyof typeof SIZE_MAP];
};

export const imagineDesign = async (req: Request, res: Response) => {
  const rawPrompt = typeof req.body?.prompt === 'string' ? sanitizePrompt(req.body.prompt) : '';
  if (!rawPrompt || rawPrompt.length < 5) {
    logger.warn('Imagine input validation failed', { issues: 1, reason: 'prompt_length' });
    return res.status(400).json({ ok: false, error: 'INVALID_INPUT' });
  }
  const body = {
    prompt: rawPrompt,
    size: normalizeSize(req.body?.size),
  };

  const parsed = imagineSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn('Imagine input validation failed', { issues: parsed.error.issues.length });
    return res.status(400).json({ ok: false, error: 'INVALID_INPUT' });
  }

  if (!isPromptAllowed(parsed.data.prompt)) {
    logger.warn('Imagine prompt rejected by safety filter', { length: parsed.data.prompt.length });
    return res.status(400).json({ ok: false, error: 'INVALID_INPUT' });
  }

  try {
    const result = await imagineService.generateImaginedDesign({
      prompt: parsed.data.prompt,
      size: parsed.data.size,
    });

    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (error) {
    const status = typeof (error as { status?: number })?.status === 'number' ? (error as { status?: number }).status : undefined;
    const errorCode = (error as { errorCode?: ImagineServiceErrorCode })?.errorCode;

    logger.error('Imagine generation failed', {
      status: status ?? 'unknown',
      message: (error as Error)?.message ?? 'Unknown error',
    });

    if (errorCode === 'INVALID_PROMPT_OR_FORMAT') {
      return res.status(400).json({ ok: false, error: 'INVALID_PROMPT_OR_FORMAT' });
    }

    if (errorCode === 'OPENAI_QUOTA') {
      const quotaStatus = status === 402 ? 402 : 429;
      return res.status(quotaStatus).json({ ok: false, error: 'OPENAI_QUOTA' });
    }

    if (errorCode === 'OPENAI_AUTH') {
      return res.status(401).json({ ok: false, error: 'OPENAI_AUTH' });
    }

    if (errorCode === 'OPENAI_UPSTREAM') {
      const upstreamStatus = status === 504 ? 504 : 502;
      return res.status(upstreamStatus).json({ ok: false, error: 'OPENAI_UPSTREAM' });
    }

    return res.status(502).json({ ok: false, error: 'IMAGE_GENERATION_FAILED' });
  }
};
