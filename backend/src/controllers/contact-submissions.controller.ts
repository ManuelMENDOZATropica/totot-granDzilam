import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  assignContactSubmission,
  createContactSubmission,
  listContactSubmissionsForAdmin,
  listContactSubmissionsForUser,
} from '../services/contact-submissions.service';
import { HttpError } from '../utils/errors';

const submissionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  correo: z.string().email('Correo inválido'),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
  interes: z.string().min(1, 'El interés es obligatorio'),
});

const assignmentSchema = z
  .object({ assignedTo: z.string().min(1).nullable().optional() })
  .refine((value) => Object.prototype.hasOwnProperty.call(value, 'assignedTo'), {
    message: 'Debes indicar a quién asignar el contacto o dejarlo sin asignar',
  });

const submissionIdSchema = z.string().min(1, 'Identificador inválido');

export const createContactSubmissionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = submissionSchema.parse(req.body ?? {});
    const created = await createContactSubmission(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const listAssignedContactSubmissionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new HttpError(401, 'No autorizado');
    }
    const submissions = await listContactSubmissionsForUser(req.user.sub);
    res.json({ items: submissions });
  } catch (error) {
    next(error);
  }
};

export const listAdminContactSubmissionsController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const submissions = await listContactSubmissionsForAdmin();
    res.json({ items: submissions });
  } catch (error) {
    next(error);
  }
};

export const assignContactSubmissionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = submissionIdSchema.parse(req.params.id);
    const payload = assignmentSchema.parse(req.body ?? {});
    const updated = await assignContactSubmission(id, payload.assignedTo ?? null);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
