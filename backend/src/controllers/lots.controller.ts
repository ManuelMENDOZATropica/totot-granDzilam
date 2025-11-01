import { Request, Response } from 'express';
import { lotsMock, LotStatus } from '../data/lots.mock';

type LotsQuery = {
  page?: string;
  pageSize?: string;
  estatus?: string;
  superficieMin?: string;
  superficieMax?: string;
  q?: string;
};

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseFloatSafe = (value: string | undefined) => {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const listLots = (req: Request<unknown, unknown, unknown, LotsQuery>, res: Response) => {
  const { page: pageRaw, pageSize: pageSizeRaw, estatus, superficieMin, superficieMax, q } =
    req.query;

  const page = parsePositiveInt(pageRaw, 1);
  const pageSize = Math.min(parsePositiveInt(pageSizeRaw, 12), 60);

  let filtered = lotsMock.slice();

  if (estatus && ['disponible', 'vendido', 'apartado'].includes(estatus)) {
    filtered = filtered.filter((lot) => lot.estatus === (estatus as LotStatus));
  }

  const surfaceMinNum = parseFloatSafe(superficieMin);
  const surfaceMaxNum = parseFloatSafe(superficieMax);

  if (surfaceMinNum !== undefined) {
    filtered = filtered.filter((lot) => lot.superficieM2 >= surfaceMinNum);
  }

  if (surfaceMaxNum !== undefined) {
    filtered = filtered.filter((lot) => lot.superficieM2 <= surfaceMaxNum);
  }

  if (q) {
    const term = q.toLowerCase();
    filtered = filtered.filter(
      (lot) => lot.id.toLowerCase().includes(term) || lot.manzana.toLowerCase().includes(term),
    );
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  res.json({ items, page, pageSize, total });
};
