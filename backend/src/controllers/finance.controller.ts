import { Request, Response } from 'express';
import { calculateFinance } from '../utils/finance';
import { lotsMock } from '../data/lots.mock';

interface FinanceRequestBody {
  lotIds?: string[];
  porcentajeEnganche?: number;
  meses?: number;
}

export const simulateFinance = (req: Request<unknown, unknown, FinanceRequestBody>, res: Response) => {
  const { lotIds = [], porcentajeEnganche = 30, meses = 36 } = req.body ?? {};

  if (!Array.isArray(lotIds)) {
    return res.status(400).json({ message: 'lotIds debe ser un arreglo.' });
  }

  const selectedLots = lotsMock.filter((lot) => lotIds.includes(lot.id));

  const notFoundIds = lotIds.filter((id) => !selectedLots.some((lot) => lot.id === id));
  if (notFoundIds.length > 0) {
    return res.status(400).json({ message: `Los lotes ${notFoundIds.join(', ')} no existen.` });
  }

  const unavailableLots = selectedLots.filter((lot) => lot.estado !== 'disponible');
  if (unavailableLots.length > 0) {
    return res
      .status(400)
      .json({
        message: `Los lotes ${unavailableLots.map((lot) => lot.id).join(', ')} no están disponibles.`,
      });
  }

  if (!Number.isFinite(meses) || meses < 1) {
    return res.status(400).json({ message: 'El plazo en meses debe ser mayor o igual a 1.' });
  }

  const totalSeleccionado = selectedLots.reduce((sum, lot) => sum + lot.precio, 0);

  try {
    const result = calculateFinance({
      totalSeleccionado,
      porcentajeEnganche,
      meses,
    });

    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};
