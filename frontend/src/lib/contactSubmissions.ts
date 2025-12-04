import { apiFetch } from './http';
import { type AdminUser } from './admin';

export interface ContactSubmission {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  interes: string;
  createdAt: string;
  assignedTo: Pick<AdminUser, 'id' | 'name' | 'email'> | null;
}

interface SubmissionsResponse {
  items: ContactSubmission[];
}

const parseErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload?.message ?? 'Ocurrió un error inesperado';
  } catch {
    return 'Ocurrió un error inesperado';
  }
};

export type CreateContactSubmissionPayload = Pick<
  ContactSubmission,
  'nombre' | 'correo' | 'telefono' | 'interes'
>;

export const createContactSubmission = async (payload: CreateContactSubmissionPayload): Promise<ContactSubmission> => {
  const response = await apiFetch('/api/contact-submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ContactSubmission;
};

const authorizedFetch = (token: string, path: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return apiFetch(path, { ...init, headers });
};

export const fetchMyContactSubmissions = async (token: string): Promise<ContactSubmission[]> => {
  const response = await authorizedFetch(token, '/api/contact-submissions');

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as SubmissionsResponse;
  return data.items ?? [];
};

export const fetchAdminContactSubmissions = async (token: string): Promise<ContactSubmission[]> => {
  const response = await authorizedFetch(token, '/api/admin/contact-submissions');

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as SubmissionsResponse;
  return data.items ?? [];
};

export const assignContactSubmission = async (
  token: string,
  id: string,
  assignedTo: string | null,
): Promise<ContactSubmission> => {
  const response = await authorizedFetch(token, `/api/admin/contact-submissions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedTo }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ContactSubmission;
};
