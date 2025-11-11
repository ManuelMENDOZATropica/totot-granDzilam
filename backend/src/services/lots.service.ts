import { LotModel, type Lot, type LotEstado } from '../models/lot.model';
import { HttpError } from '../utils/errors';

export interface PublicLot {
  id: string;
  superficieM2: number;
  precio: number;
  estado: LotEstado;
  order: number;
}

export interface AdminLot {
  id: string; // database identifier
  identifier: string; // public-facing identifier
  superficieM2: number;
  precio: number;
  estado: LotEstado;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type LotRecord = Lot & { _id: unknown; createdAt: Date; updatedAt: Date };

const toPublicLot = (lot: LotRecord): PublicLot => ({
  id: lot.identifier,
  superficieM2: lot.superficieM2,
  precio: lot.precio,
  estado: lot.estado,
  order: lot.order ?? 0,
});

const toAdminLot = (lot: LotRecord): AdminLot => ({
  id: String((lot as { _id: unknown })._id),
  identifier: lot.identifier,
  superficieM2: lot.superficieM2,
  precio: lot.precio,
  estado: lot.estado,
  order: lot.order ?? 0,
  createdAt: lot.createdAt.toISOString(),
  updatedAt: lot.updatedAt.toISOString(),
});

export const fetchLots = async (): Promise<PublicLot[]> => {
  const lots = await LotModel.find().sort({ order: 1, createdAt: 1 }).lean<LotRecord[]>();
  return lots.map(toPublicLot);
};

export const fetchAdminLots = async (): Promise<AdminLot[]> => {
  const lots = await LotModel.find().sort({ order: 1, createdAt: 1 }).lean<LotRecord[]>();
  return lots.map(toAdminLot);
};

interface LotPayload {
  identifier: string;
  superficieM2: number;
  precio: number;
  estado: LotEstado;
  order?: number;
}

const normalizeIdentifier = (identifier: string) => identifier.trim();

export const createLot = async (payload: LotPayload): Promise<AdminLot> => {
  const data = {
    ...payload,
    identifier: normalizeIdentifier(payload.identifier),
    order: payload.order ?? 0,
  };

  const existing = await LotModel.findOne({ identifier: data.identifier });
  if (existing) {
    throw new HttpError(409, 'Ya existe un lote con ese identificador');
  }

  const created = await LotModel.create(data);
  return toAdminLot(created.toObject() as LotRecord);
};

export const updateLot = async (id: string, payload: Partial<LotPayload>): Promise<AdminLot> => {
  const data: Partial<LotPayload> = { ...payload };
  if (data.identifier) {
    data.identifier = normalizeIdentifier(data.identifier);
    const duplicate = await LotModel.findOne({ identifier: data.identifier, _id: { $ne: id } });
    if (duplicate) {
      throw new HttpError(409, 'Ya existe otro lote con ese identificador');
    }
  }

  const updated = await LotModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new HttpError(404, 'Lote no encontrado');
  }

  return toAdminLot(updated.toObject() as LotRecord);
};

export const deleteLot = async (id: string): Promise<void> => {
  const deleted = await LotModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new HttpError(404, 'Lote no encontrado');
  }
};

export const findLotsByIdentifiers = async (identifiers: string[]): Promise<LotRecord[]> => {
  if (!identifiers.length) {
    return [];
  }

  return LotModel.find({ identifier: { $in: identifiers.map((value) => value.trim()) } }).lean<LotRecord[]>();
};
