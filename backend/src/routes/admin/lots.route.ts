import { Router } from 'express';
import {
  createLotController,
  deleteLotController,
  listLotsAdmin,
  updateLotController,
} from '../../controllers/lots.controller';

export const adminLotsRouter = Router();

adminLotsRouter.get('/', listLotsAdmin);
adminLotsRouter.post('/', createLotController);
adminLotsRouter.patch('/:id', updateLotController);
adminLotsRouter.delete('/:id', deleteLotController);
