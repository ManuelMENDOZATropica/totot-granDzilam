import { Schema, model } from 'mongoose';
import type { ImagineImageSize } from '../types/imagine';

export interface ImagineImage {
  prompt: string;
  promptVisual: string;
  textoInspirador: string;
  imageUrl: string | null;
  imageBase64?: string | null;
  size: ImagineImageSize;
  createdAt: Date;
  updatedAt: Date;
}

const imagineImageSchema = new Schema<ImagineImage>(
  {
    prompt: { type: String, required: true, trim: true },
    promptVisual: { type: String, required: true },
    textoInspirador: { type: String, required: true },
    imageUrl: { type: String, default: null },
    imageBase64: { type: String, default: null },
    size: { type: String, enum: ['1024x1024', '1024x1536', '1536x1024'], required: true },
  },
  { timestamps: true },
);

imagineImageSchema.index({ createdAt: -1 });

export const ImagineImageModel = model<ImagineImage>('ImagineImage', imagineImageSchema);
