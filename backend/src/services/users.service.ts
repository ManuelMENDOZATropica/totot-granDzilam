import { HttpError } from '../utils/errors';
import { UserModel, type User, type UserRole } from '../models/user.model';
import { hashPassword } from '../utils/password';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
}

type UserRecord = User & { _id: unknown; createdAt: Date; updatedAt: Date };

const toDto = (user: UserRecord): UserDTO => ({
  id: String((user as { _id: unknown })._id),
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export const listUsers = async (): Promise<UserDTO[]> => {
  const users = await UserModel.find().sort({ createdAt: -1 }).lean<UserRecord[]>();
  return users.map(toDto);
};

export const createUser = async ({ email, name, password, role }: CreateUserInput): Promise<UserDTO> => {
  const normalizedEmail = email.toLowerCase();
  const exists = await UserModel.findOne({ email: normalizedEmail });
  if (exists) {
    throw new HttpError(409, 'Ya existe un usuario con ese correo');
  }

  const passwordHash = hashPassword(password);
  const created = await UserModel.create({
    email: normalizedEmail,
    name,
    passwordHash,
    role,
  });

  return toDto(created.toObject() as UserRecord);
};

export const updateUser = async (id: string, payload: UpdateUserInput): Promise<UserDTO> => {
  const data: Partial<UserRecord> = {};

  if (payload.email) {
    const normalizedEmail = payload.email.toLowerCase();
    const exists = await UserModel.findOne({ email: normalizedEmail, _id: { $ne: id } });
    if (exists) {
      throw new HttpError(409, 'Ya existe un usuario con ese correo');
    }
    data.email = normalizedEmail;
  }

  if (payload.name) {
    data.name = payload.name;
  }

  if (payload.role) {
    data.role = payload.role;
  }

  if (payload.password) {
    data.passwordHash = hashPassword(payload.password);
  }

  const updated = await UserModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new HttpError(404, 'Usuario no encontrado');
  }

  return toDto(updated.toObject() as UserRecord);
};

export const deleteUser = async (id: string): Promise<void> => {
  const deleted = await UserModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new HttpError(404, 'Usuario no encontrado');
  }
};
