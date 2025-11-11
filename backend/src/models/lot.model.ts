import { Schema, model } from 'mongoose';

export type LotEstado = 'disponible' | 'vendido' | 'apartado';

export interface Lot {
  identifier: string;
  superficieM2: number;
  precio: number;
  estado: LotEstado;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const lotSchema = new Schema<Lot>(
  {
    identifier: { type: String, required: true, unique: true, trim: true },
    superficieM2: { type: Number, required: true, min: 0 },
    precio: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ['disponible', 'vendido', 'apartado'],
      default: 'disponible',
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

lotSchema.index({ order: 1 });

export const LotModel = model<Lot>('Lot', lotSchema);
