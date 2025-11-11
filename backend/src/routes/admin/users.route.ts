import { Router } from 'express';
import {
  createUserController,
  deleteUserController,
  listUsersController,
  updateUserController,
} from '../../controllers/users.controller';

export const adminUsersRouter = Router();

adminUsersRouter.get('/', listUsersController);
adminUsersRouter.post('/', createUserController);
adminUsersRouter.patch('/:id', updateUserController);
adminUsersRouter.delete('/:id', deleteUserController);
