import { Schema, model } from 'mongoose';

export interface FinanceSettings {
  minEnganche: number;
  maxEnganche: number;
  defaultEnganche: number;
  minMeses: number;
  maxMeses: number;
  defaultMeses: number;
  interes: number;
  /** Cómo se lee `interes`: 'total' (recargo único, comportamiento histórico) o 'anual'. */
  tipoInteres: 'total' | 'anual';
  pasoMensualidad: number;
  mensualidadCerrada: number;
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
    // Por defecto 'total' para no alterar ninguna cotización existente al desplegar.
    tipoInteres: { type: String, required: true, enum: ['total', 'anual'], default: 'total' },
    pasoMensualidad: { type: Number, required: true, default: 1000 },
    mensualidadCerrada: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export const FinanceSettingsModel = model<FinanceSettings>(
  'FinanceSettings',
  financeSettingsSchema,
);
