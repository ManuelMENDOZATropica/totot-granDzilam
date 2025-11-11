import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  createLot,
  deleteLot,
  fetchAdminLots,
  fetchLots,
  updateLot,
} from '../services/lots.service';

const lotPayloadSchema = z.object({
  identifier: z.string().min(1, 'El identificador es obligatorio'),
  superficieM2: z.coerce.number().min(0, 'La superficie debe ser positiva'),
  precio: z.coerce.number().min(0, 'El precio debe ser positivo'),
  estado: z.enum(['disponible', 'vendido', 'apartado']),
  order: z.coerce.number().int().min(0).optional(),
});

const lotUpdateSchema = lotPayloadSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'No se recibieron cambios para el lote',
});

const lotIdSchema = z.string().min(1, 'Identificador inválido');

export const listLots = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const lots = await fetchLots();
    const total = lots.length;
    res.json({ items: lots, total, page: 1, pageSize: total });
  } catch (error) {
    next(error);
  }
};

export const listLotsAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const lots = await fetchAdminLots();
    res.json({ items: lots });
  } catch (error) {
    next(error);
  }
};

export const createLotController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = lotPayloadSchema.parse(req.body);
    const lot = await createLot(payload);
    res.status(201).json(lot);
  } catch (error) {
    next(error);
  }
};

export const updateLotController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = lotIdSchema.parse(req.params.id);
    const payload = lotUpdateSchema.parse(req.body);
    const lot = await updateLot(id, payload);
    res.json(lot);
  } catch (error) {
    next(error);
  }
};

export const deleteLotController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = lotIdSchema.parse(req.params.id);
    await deleteLot(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
