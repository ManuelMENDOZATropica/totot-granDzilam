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
  maxMeses: 60,
  defaultMeses: 36,
  interes: 0,
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
