import { apiFetch } from './http';

export interface FinanceSettingsDTO {
  minEnganche: number;
  maxEnganche: number;
  defaultEnganche: number;
  minMeses: number;
  maxMeses: number;
  defaultMeses: number;
  interes: number;
  /** 'total' = recargo único sobre el saldo. 'anual' = crédito amortizado. */
  tipoInteres?: 'total' | 'anual';
  pasoMensualidad: number;
  mensualidadCerrada: number;
}

const normalizeFinanceSettings = (payload: FinanceSettingsDTO): FinanceSettingsDTO => ({
  ...payload,
  // 'total' es el valor por defecto del modelo en Mongo; si no llega, se asume ese y no
  // el amortizado, que cobraría más de lo pactado.
  tipoInteres: payload.tipoInteres ?? 'total',
  pasoMensualidad: payload.pasoMensualidad ?? 1000,
  mensualidadCerrada: payload.mensualidadCerrada ?? 0,
});

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

  return normalizeFinanceSettings((await response.json()) as FinanceSettingsDTO);
};

export const updateFinanceSettings = async (
  payload: Partial<FinanceSettingsDTO>,
): Promise<FinanceSettingsDTO> => {
  const response = await apiFetch('/api/finance-settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return normalizeFinanceSettings((await response.json()) as FinanceSettingsDTO);
};
