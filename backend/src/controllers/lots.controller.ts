import { Request, Response } from 'express';
import { lotsMock } from '../data/lots.mock';

export const listLots = (_req: Request, res: Response) => {
  res.json(lotsMock);
};
