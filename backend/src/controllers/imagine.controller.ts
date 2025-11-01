import type { Request, Response } from 'express';
import { z } from 'zod';
import { imagineService } from '../services/imagine.service';
import { sanitizePrompt, isPromptAllowed } from '../utils/prompt';
import { logger } from '../utils/logger';

const imagineSchema = z.object({
  prompt: z.string().min(5).max(400),
  size: z.enum(['1024x1024', '768x768', '512x512']).optional(),
});

export const imagineDesign = async (req: Request, res: Response) => {
  const rawPrompt = typeof req.body?.prompt === 'string' ? sanitizePrompt(req.body.prompt) : '';
  const body = {
    prompt: rawPrompt,
    size: req.body?.size,
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
    logger.error('Imagine generation failed', error);
    return res.status(502).json({ ok: false, error: 'IMAGE_GENERATION_FAILED' });
  }
};
