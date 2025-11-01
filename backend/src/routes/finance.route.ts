import { Router } from 'express';
import { simulateFinance } from '../controllers/finance.controller';

export const financeRouter = Router();

financeRouter.post('/simulate', simulateFinance);
