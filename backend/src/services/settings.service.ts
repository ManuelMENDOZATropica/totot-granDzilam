import { FinanceSettingsModel, type FinanceSettings } from '../models/finance-settings.model';

export interface FinanceSettingsDTO {
  minEnganche: number;
  maxEnganche: number;
  defaultEnganche: number;
  minMeses: number;
  maxMeses: number;
  defaultMeses: number;
  interes: number;
}

const DEFAULT_SETTINGS: FinanceSettingsDTO = {
  minEnganche: 10,
  maxEnganche: 80,
  defaultEnganche: 30,
  minMeses: 6,
  maxMeses: 50,
  defaultMeses: 36,
  interes: 0,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeSettings = (settings: FinanceSettingsDTO): FinanceSettingsDTO => {
  const minEnganche = clamp(settings.minEnganche, 0, 100);
  const maxEnganche = clamp(settings.maxEnganche, minEnganche, 100);
  const minMeses = clamp(settings.minMeses, 1, 50);
  const maxMeses = clamp(settings.maxMeses, minMeses, 50);

  return {
    ...settings,
    minEnganche,
    maxEnganche,
    minMeses,
    maxMeses,
    defaultEnganche: clamp(settings.defaultEnganche, minEnganche, maxEnganche),
    defaultMeses: clamp(settings.defaultMeses, minMeses, maxMeses),
  };
};

const toDto = (settings: FinanceSettings): FinanceSettingsDTO => ({
  minEnganche: settings.minEnganche,
  maxEnganche: settings.maxEnganche,
  defaultEnganche: settings.defaultEnganche,
  minMeses: settings.minMeses,
  maxMeses: settings.maxMeses,
  defaultMeses: settings.defaultMeses,
  interes: settings.interes,
});

export const getFinanceSettings = async (): Promise<FinanceSettingsDTO> => {
  const settings = await FinanceSettingsModel.findOne().lean<FinanceSettings>();
  if (!settings) {
    return normalizeSettings(DEFAULT_SETTINGS);
  }

  return normalizeSettings(toDto(settings));
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
    return normalizeSettings(DEFAULT_SETTINGS);
  }

  return normalizeSettings(toDto(updated));
};
