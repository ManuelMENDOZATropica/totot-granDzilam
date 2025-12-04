import { apiFetch } from './http';

export type EstadoLote = 'disponible' | 'vendido' | 'apartado';
export type LotStatus = EstadoLote;

export interface LoteDTO {
  id: string;
  superficieM2: number;
  precio: number;
  estado: EstadoLote;
  nombre?: string;
  precioTotal?: number;
}

export type Lot = LoteDTO;

export interface LotsResponse {
  items: LoteDTO[];
  total: number;
  page: number;
  pageSize: number;
}

const isValidLot = (value: unknown): value is LoteDTO => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.superficieM2 === 'number' &&
    typeof candidate.precio === 'number' &&
    (candidate.estado === 'disponible' || candidate.estado === 'vendido' || candidate.estado === 'apartado')
  );
};

const normalizeLots = (items: unknown[]): LoteDTO[] => {
  return items.filter(isValidLot);
};

export const obtenerLotes = async (signal?: AbortSignal): Promise<LotsResponse> => {
  const respuesta = await apiFetch('/api/lots', { signal });

  if (!respuesta.ok) {
    throw new Error('No se pudo obtener la lista de lotes');
  }

  const payload = await respuesta.json();

  if (Array.isArray(payload)) {
    const items = normalizeLots(payload);
    return {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length,
    };
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as Record<string, unknown>).items)) {
    const source = payload as Record<string, unknown>;
    const items = normalizeLots(source.items as unknown[]);
    return {
      items,
      total: typeof source.total === 'number' ? source.total : items.length,
      page: typeof source.page === 'number' ? source.page : 1,
      pageSize: typeof source.pageSize === 'number' ? source.pageSize : items.length,
    };
  }

  throw new Error('La respuesta de lotes no tiene el formato esperado');
};

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export const fetchHealth = async (signal?: AbortSignal): Promise<HealthResponse> => {
  const response = await fetch('/api/health', { signal });

  if (!response.ok) {
    throw new Error('No se pudo obtener el estado de salud del backend');
  }

  const data = (await response.json()) as HealthResponse;
  return data;
};
