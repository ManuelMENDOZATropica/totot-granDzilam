import { Schema, model, Types } from 'mongoose';

export interface ContactSubmission {
  nombre: string;
  correo: string;
  telefono: string;
  interes: string;
  assignedTo?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const contactSubmissionSchema = new Schema<ContactSubmission>(
  {
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, trim: true, lowercase: true },
    telefono: { type: String, required: true, trim: true },
    interes: { type: String, required: true, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

contactSubmissionSchema.index({ createdAt: -1 });

export const ContactSubmissionModel = model<ContactSubmission>('ContactSubmission', contactSubmissionSchema);
