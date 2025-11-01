import { Router } from 'express';
import { listLots } from '../controllers/lots.controller';

export const lotsRouter = Router();

lotsRouter.get('/', listLots);
