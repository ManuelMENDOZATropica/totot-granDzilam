import { apiFetch } from './http';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginSuccess {
  token: string;
  user: AuthUser;
}

const parseErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as { message?: string };
    return data?.message ?? 'Ocurrió un error inesperado';
  } catch {
    return 'Ocurrió un error inesperado';
  }
};

export const loginRequest = async (email: string, password: string): Promise<LoginSuccess> => {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password } satisfies LoginPayload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as LoginSuccess;
};

export const fetchCurrentUser = async (token: string): Promise<AuthUser> => {
  const response = await apiFetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AuthUser;
};
