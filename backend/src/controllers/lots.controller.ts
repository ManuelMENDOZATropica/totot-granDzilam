import type { Request, Response } from 'express';
import type { Lot } from '../data/lots.mock';
import { fetchLots } from '../services/lots.service';

const isValidLot = (value: unknown): value is Lot => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.superficieM2 === 'number' &&
    typeof candidate.precio === 'number' &&
    (candidate.estado === 'disponible' || candidate.estado === 'vendido' || candidate.estado === 'apartado')
  );
};

export const listLots = async (_req: Request, res: Response) => {
  try {
    const rawLots = await fetchLots();
    const sanitizedLots = Array.isArray(rawLots) ? rawLots.filter(isValidLot) : [];

    const page = 1;
    const pageSize = sanitizedLots.length;
    const total = sanitizedLots.length;

    res.json({
      items: sanitizedLots,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error listing lots', error);
    res.status(500).json({ message: 'No se pudo obtener la lista de lotes' });
  }
};
