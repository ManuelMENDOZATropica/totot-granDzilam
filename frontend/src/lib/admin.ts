import { apiFetch } from './http';
import type { EstadoLote } from './api';
import type { UserRole } from './auth';

const parseErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload?.message ?? 'Ocurrió un error inesperado';
  } catch {
    return 'Ocurrió un error inesperado';
  }
};

const authorizedFetch = (token: string, path: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return apiFetch(path, {
    ...init,
    headers,
  });
};

export interface AdminLot {
  id: string;
  identifier: string;
  superficieM2: number;
  precio: number;
  estado: EstadoLote;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminLotResponse {
  items: AdminLot[];
}

export interface SaveLotPayload {
  identifier: string;
  superficieM2: number;
  precio: number;
  estado: EstadoLote;
  order?: number;
}

export const fetchAdminLots = async (token: string): Promise<AdminLot[]> => {
  const response = await authorizedFetch(token, '/api/admin/lots');
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as AdminLotResponse;
  return data.items ?? [];
};

export const createAdminLot = async (token: string, payload: SaveLotPayload): Promise<AdminLot> => {
  const response = await authorizedFetch(token, '/api/admin/lots', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminLot;
};

export const updateAdminLot = async (
  token: string,
  id: string,
  payload: Partial<SaveLotPayload>,
): Promise<AdminLot> => {
  const response = await authorizedFetch(token, `/api/admin/lots/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminLot;
};

export const deleteAdminLot = async (token: string, id: string): Promise<void> => {
  const response = await authorizedFetch(token, `/api/admin/lots/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseErrorMessage(response));
  }
};

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersResponse {
  items: AdminUser[];
}

export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
}

export const fetchAdminUsers = async (token: string): Promise<AdminUser[]> => {
  const response = await authorizedFetch(token, '/api/admin/users');

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as AdminUsersResponse;
  return data.items ?? [];
};

export const createAdminUser = async (token: string, payload: CreateUserPayload): Promise<AdminUser> => {
  const response = await authorizedFetch(token, '/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminUser;
};

export const updateAdminUser = async (
  token: string,
  id: string,
  payload: UpdateUserPayload,
): Promise<AdminUser> => {
  const response = await authorizedFetch(token, `/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminUser;
};

export const deleteAdminUser = async (token: string, id: string): Promise<void> => {
  const response = await authorizedFetch(token, `/api/admin/users/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseErrorMessage(response));
  }
};
