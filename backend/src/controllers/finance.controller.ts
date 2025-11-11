import { NextFunction, Request, Response } from 'express';
import { calculateFinance } from '../utils/finance';
import { findLotsByIdentifiers } from '../services/lots.service';
import { getFinanceSettings } from '../services/settings.service';
import { HttpError } from '../utils/errors';

interface FinanceRequestBody {
  lotIds?: string[];
  porcentajeEnganche?: number;
  meses?: number;
}

export const simulateFinance = async (
  req: Request<unknown, unknown, FinanceRequestBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { lotIds = [], porcentajeEnganche, meses } = req.body ?? {};

    if (!Array.isArray(lotIds)) {
      throw new HttpError(400, 'lotIds debe ser un arreglo.');
    }

    const trimmedIds = lotIds.map((value) => String(value).trim()).filter(Boolean);
    const lots = await findLotsByIdentifiers(trimmedIds);

    const notFoundIds = trimmedIds.filter((id) => !lots.some((lot) => lot.identifier === id));
    if (notFoundIds.length > 0) {
      throw new HttpError(400, `Los lotes ${notFoundIds.join(', ')} no existen.`);
    }

    const unavailableLots = lots.filter((lot) => lot.estado !== 'disponible');
    if (unavailableLots.length > 0) {
      throw new HttpError(
        400,
        `Los lotes ${unavailableLots.map((lot) => lot.identifier).join(', ')} no están disponibles.`,
      );
    }

    const totalSeleccionado = lots.reduce((sum, lot) => sum + lot.precio, 0);
    if (totalSeleccionado <= 0) {
      throw new HttpError(400, 'El total seleccionado debe ser mayor que cero.');
    }

    const settings = await getFinanceSettings();

    const result = calculateFinance({
      totalSeleccionado,
      porcentajeEnganche: porcentajeEnganche ?? settings.defaultEnganche,
      meses: meses ?? settings.defaultMeses,
      interes: settings.interes,
      constraints: {
        minEnganche: settings.minEnganche,
        maxEnganche: settings.maxEnganche,
        minMeses: settings.minMeses,
        maxMeses: settings.maxMeses,
      },
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};
