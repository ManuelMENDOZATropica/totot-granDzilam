import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { createUser, deleteUser, listUsers, updateUser } from '../services/users.service';
import { HttpError } from '../utils/errors';

const roleSchema = z.enum(['admin', 'editor', 'viewer']);

const createUserSchema = z.object({
  email: z.string().email('Correo inválido'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: roleSchema,
});

const updateUserSchema = z
  .object({
    email: z.string().email('Correo inválido').optional(),
    name: z.string().min(1, 'El nombre es obligatorio').optional(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
    role: roleSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'No se recibieron cambios para el usuario',
  });

const userIdSchema = z.string().min(1, 'Identificador inválido');

export const listUsersController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await listUsers();
    res.json({ items: users });
  } catch (error) {
    next(error);
  }
};

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createUserSchema.parse(req.body ?? {});
    const user = await createUser(payload);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = userIdSchema.parse(req.params.id);
    const payload = updateUserSchema.parse(req.body ?? {});
    const user = await updateUser(id, payload);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = userIdSchema.parse(req.params.id);
    if (req.user?.sub === id) {
      throw new HttpError(400, 'No puedes eliminar tu propio usuario');
    }
    await deleteUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
