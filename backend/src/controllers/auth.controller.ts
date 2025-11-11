import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { UserModel } from '../models/user.model';
import { signAuthToken } from '../utils/jwt';
import { HttpError } from '../utils/errors';
import { verifyPassword } from '../utils/password';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const mapUser = (user: { _id: unknown; email: string; name: string; role: string }) => ({
  id: String((user as { _id: unknown })._id),
  email: user.email,
  name: user.name,
  role: user.role,
});

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new HttpError(401, 'Credenciales inválidas');
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new HttpError(401, 'Credenciales inválidas');
    }

    const token = signAuthToken({
      userId: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.json({ token, user: mapUser(user) });
  } catch (error) {
    next(error);
  }
};

export const meController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new HttpError(401, 'No autorizado');
    }

    const user = await UserModel.findById(req.user.sub).lean();
    if (!user) {
      throw new HttpError(401, 'No autorizado');
    }

    res.json(mapUser(user));
  } catch (error) {
    next(error);
  }
};
