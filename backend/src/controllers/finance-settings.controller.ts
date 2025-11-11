import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { getFinanceSettings, updateFinanceSettings } from '../services/settings.service';
import { HttpError } from '../utils/errors';

const updateSchema = z.object({
  minEnganche: z.coerce.number().min(0).max(100).optional(),
  maxEnganche: z.coerce.number().min(0).max(100).optional(),
  defaultEnganche: z.coerce.number().min(0).max(100).optional(),
  minMeses: z.coerce.number().min(1).max(600).optional(),
  maxMeses: z.coerce.number().min(1).max(600).optional(),
  defaultMeses: z.coerce.number().min(1).max(600).optional(),
  interes: z.coerce.number().min(0).max(100).optional(),
});

export const getFinanceSettingsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await getFinanceSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateFinanceSettingsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updates = updateSchema.parse(req.body ?? {});
    const current = await getFinanceSettings();
    const merged = { ...current, ...updates };

    if (merged.minEnganche > merged.maxEnganche) {
      throw new HttpError(400, 'El enganche mínimo no puede ser mayor al máximo');
    }

    if (merged.defaultEnganche < merged.minEnganche || merged.defaultEnganche > merged.maxEnganche) {
      throw new HttpError(400, 'El enganche predeterminado debe estar dentro del rango establecido');
    }

    if (merged.minMeses > merged.maxMeses) {
      throw new HttpError(400, 'El plazo mínimo no puede ser mayor al máximo');
    }

    if (merged.defaultMeses < merged.minMeses || merged.defaultMeses > merged.maxMeses) {
      throw new HttpError(400, 'El plazo predeterminado debe estar dentro del rango establecido');
    }

    const settings = await updateFinanceSettings(updates);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};
