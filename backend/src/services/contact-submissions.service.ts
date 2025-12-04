import { ContactSubmissionModel, type ContactSubmission } from '../models/contact-submission.model';
import { UserModel, type User } from '../models/user.model';
import { HttpError } from '../utils/errors';

export interface ContactSubmissionDTO {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  interes: string;
  assignedTo: { id: string; name: string; email: string } | null;
  createdAt: string;
}

type ContactSubmissionRecord = ContactSubmission & {
  _id: unknown;
  createdAt: Date;
  assignedTo?: User | null;
};

const toDto = (submission: ContactSubmissionRecord): ContactSubmissionDTO => ({
  id: String((submission as { _id: unknown })._id),
  nombre: submission.nombre,
  correo: submission.correo,
  telefono: submission.telefono,
  interes: submission.interes,
  assignedTo: submission.assignedTo
    ? {
        id: String((submission.assignedTo as { _id: unknown })._id),
        name: submission.assignedTo.name,
        email: submission.assignedTo.email,
      }
    : null,
  createdAt: submission.createdAt.toISOString(),
});

export const createContactSubmission = async (input: {
  nombre: string;
  correo: string;
  telefono: string;
  interes: string;
}): Promise<ContactSubmissionDTO> => {
  const created = await ContactSubmissionModel.create({
    nombre: input.nombre.trim(),
    correo: input.correo.toLowerCase().trim(),
    telefono: input.telefono.trim(),
    interes: input.interes.trim(),
  });

  return toDto(created.toObject() as ContactSubmissionRecord);
};

export const listContactSubmissionsForAdmin = async (): Promise<ContactSubmissionDTO[]> => {
  const submissions = await ContactSubmissionModel.find()
    .sort({ createdAt: -1 })
    .populate('assignedTo')
    .lean<ContactSubmissionRecord[]>();

  return submissions.map(toDto);
};

export const listContactSubmissionsForUser = async (userId: string): Promise<ContactSubmissionDTO[]> => {
  const submissions = await ContactSubmissionModel.find({ assignedTo: userId })
    .sort({ createdAt: -1 })
    .lean<ContactSubmissionRecord[]>();

  return submissions.map((submission) => ({
    ...toDto(submission),
    assignedTo: null,
  }));
};

export const assignContactSubmission = async (
  submissionId: string,
  assignedTo: string | null,
): Promise<ContactSubmissionDTO> => {
  if (assignedTo) {
    const userExists = await UserModel.exists({ _id: assignedTo });
    if (!userExists) {
      throw new HttpError(404, 'El usuario asignado no existe');
    }
  }

  const updated = await ContactSubmissionModel.findByIdAndUpdate(
    submissionId,
    { assignedTo: assignedTo ?? null },
    { new: true, runValidators: true },
  )
    .populate('assignedTo')
    .lean<ContactSubmissionRecord | null>();

  if (!updated) {
    throw new HttpError(404, 'Registro de contacto no encontrado');
  }

  return toDto(updated);
};
