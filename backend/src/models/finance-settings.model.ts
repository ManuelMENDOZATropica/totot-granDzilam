import { Schema, model } from 'mongoose';

export interface FinanceSettings {
  minEnganche: number;
  maxEnganche: number;
  defaultEnganche: number;
  minMeses: number;
  maxMeses: number;
  defaultMeses: number;
  interes: number;
  createdAt: Date;
  updatedAt: Date;
}

const financeSettingsSchema = new Schema<FinanceSettings>(
  {
    minEnganche: { type: Number, required: true, default: 10 },
    maxEnganche: { type: Number, required: true, default: 80 },
    defaultEnganche: { type: Number, required: true, default: 30 },
    minMeses: { type: Number, required: true, default: 6 },
    maxMeses: { type: Number, required: true, default: 60 },
    defaultMeses: { type: Number, required: true, default: 36 },
    interes: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export const FinanceSettingsModel = model<FinanceSettings>('FinanceSettings', financeSettingsSchema);
