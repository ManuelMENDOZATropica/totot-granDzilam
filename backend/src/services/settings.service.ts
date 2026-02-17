import { FinanceSettingsModel, type FinanceSettings } from '../models/finance-settings.model';

export interface FinanceSettingsDTO {
  minEnganche: number;
  maxEnganche: number;
  defaultEnganche: number;
  minMeses: number;
  maxMeses: number;
  defaultMeses: number;
  interes: number;
  pasoMensualidad: number;
  mensualidadCerrada: number;
}

const DEFAULT_SETTINGS: FinanceSettingsDTO = {
  minEnganche: 10,
  maxEnganche: 80,
  defaultEnganche: 30,
  minMeses: 6,
  maxMeses: 60,
  defaultMeses: 36,
  interes: 0,
  pasoMensualidad: 1000,
  mensualidadCerrada: 0,
};

const toDto = (settings: FinanceSettings): FinanceSettingsDTO => ({
  minEnganche: settings.minEnganche ?? DEFAULT_SETTINGS.minEnganche,
  maxEnganche: settings.maxEnganche ?? DEFAULT_SETTINGS.maxEnganche,
  defaultEnganche: settings.defaultEnganche ?? DEFAULT_SETTINGS.defaultEnganche,
  minMeses: settings.minMeses ?? DEFAULT_SETTINGS.minMeses,
  maxMeses: settings.maxMeses ?? DEFAULT_SETTINGS.maxMeses,
  defaultMeses: settings.defaultMeses ?? DEFAULT_SETTINGS.defaultMeses,
  interes: settings.interes ?? DEFAULT_SETTINGS.interes,
  pasoMensualidad: settings.pasoMensualidad ?? DEFAULT_SETTINGS.pasoMensualidad,
  mensualidadCerrada: settings.mensualidadCerrada ?? DEFAULT_SETTINGS.mensualidadCerrada,
});

export const getFinanceSettings = async (): Promise<FinanceSettingsDTO> => {
  const settings = await FinanceSettingsModel.findOne().lean<FinanceSettings>();
  if (!settings) {
    return DEFAULT_SETTINGS;
  }

  return toDto(settings);
};

export const updateFinanceSettings = async (
  payload: Partial<FinanceSettingsDTO>,
): Promise<FinanceSettingsDTO> => {
  const updated = await FinanceSettingsModel.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  if (!updated) {
    return DEFAULT_SETTINGS;
  }

  return toDto(updated);
};
