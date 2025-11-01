import type { Request, Response } from 'express';
import { z } from 'zod';
import { imagineService } from '../services/imagine.service';
import type { ImagineImageSize, ImagineServiceErrorCode } from '../services/imagine.service';
import { sanitizePrompt, isPromptAllowed } from '../utils/prompt';
import { logger } from '../utils/logger';

const imagineSchema = z.object({
  prompt: z.string().min(5).max(400),
});

const DEFAULT_SIZE: ImagineImageSize = '1024x1024';

const SIZE_MAP: Record<string, ImagineImageSize | 'auto'> = {
  '1024x1024': '1024x1024',
  '1024x1536': '1024x1536',
  '1536x1024': '1536x1024',
  auto: 'auto',
};

const normalizeSize = (value: unknown): { requested: string | null; effective: ImagineImageSize } => {
  if (typeof value !== 'string') {
    return { requested: null, effective: DEFAULT_SIZE };
  }

  const key = value.trim().toLowerCase();
  const mapped = SIZE_MAP[key as keyof typeof SIZE_MAP];

  if (!mapped) {
    return { requested: key, effective: DEFAULT_SIZE };
  }

  if (mapped === 'auto') {
    return { requested: 'auto', effective: DEFAULT_SIZE };
  }

  return { requested: mapped, effective: mapped };
};

export const imagineDesign = async (req: Request, res: Response) => {
  const rawPrompt = typeof req.body?.prompt === 'string' ? sanitizePrompt(req.body.prompt) : '';
  if (!rawPrompt || rawPrompt.length < 5) {
    logger.warn('Imagine input validation failed', { issues: 1, reason: 'prompt_length' });
    return res.status(400).json({
      ok: false,
      error: 'INVALID_INPUT',
      message: 'El prompt debe tener entre 5 y 400 caracteres.',
    });
  }
  const normalizedSize = normalizeSize(req.body?.size);

  const body = {
    prompt: rawPrompt,
  };

  const parsed = imagineSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn('Imagine input validation failed', { issues: parsed.error.issues.length });
    return res.status(400).json({
      ok: false,
      error: 'INVALID_INPUT',
      message: 'El prompt debe tener entre 5 y 400 caracteres.',
    });
  }

  if (!isPromptAllowed(parsed.data.prompt)) {
    logger.warn('Imagine prompt rejected by safety filter', { length: parsed.data.prompt.length });
    return res.status(400).json({
      ok: false,
      error: 'INVALID_INPUT',
      message: 'El prompt contiene contenido no permitido.',
    });
  }

  try {
    const result = await imagineService.generateImaginedDesign({
      prompt: parsed.data.prompt,
      size: normalizedSize.effective,
    });

    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (error) {
    const status = typeof (error as { status?: number })?.status === 'number' ? (error as { status?: number }).status : undefined;
    const errorCode = (error as { errorCode?: ImagineServiceErrorCode })?.errorCode;

    const message = (error as Error)?.message ?? 'Unknown error';
    logger.error('Imagine generation failed', {
      status: status ?? 'unknown',
      message,
    });

    if (errorCode === 'INVALID_PROMPT_OR_FORMAT') {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_PROMPT_OR_FORMAT',
        message,
      });
    }

    if (errorCode === 'OPENAI_QUOTA') {
      const quotaStatus = status === 402 ? 402 : 429;
      return res.status(quotaStatus).json({ ok: false, error: 'OPENAI_QUOTA', message });
    }

    if (errorCode === 'OPENAI_AUTH') {
      return res.status(401).json({ ok: false, error: 'OPENAI_AUTH', message });
    }

    if (errorCode === 'OPENAI_UPSTREAM') {
      const upstreamStatus = status === 504 ? 504 : 502;
      return res.status(upstreamStatus).json({ ok: false, error: 'OPENAI_UPSTREAM', message });
    }

    return res.status(502).json({ ok: false, error: 'IMAGE_GENERATION_FAILED', message });
  }
};
