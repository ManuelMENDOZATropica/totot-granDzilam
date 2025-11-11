import { apiFetch } from './http';

export interface FinanceSettingsDTO {
  minEnganche: number;
  maxEnganche: number;
  defaultEnganche: number;
  minMeses: number;
  maxMeses: number;
  defaultMeses: number;
  interes: number;
}

const parseErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload?.message ?? 'Ocurrió un error inesperado';
  } catch {
    return 'Ocurrió un error inesperado';
  }
};

export const fetchFinanceSettings = async (): Promise<FinanceSettingsDTO> => {
  const response = await apiFetch('/api/finance-settings');

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as FinanceSettingsDTO;
};

export const updateFinanceSettings = async (
  token: string,
  payload: Partial<FinanceSettingsDTO>,
): Promise<FinanceSettingsDTO> => {
  const response = await apiFetch('/api/finance-settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as FinanceSettingsDTO;
};
