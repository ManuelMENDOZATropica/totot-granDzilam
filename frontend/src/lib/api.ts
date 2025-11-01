export type EstadoLote = 'disponible' | 'vendido' | 'apartado';
export type LotStatus = EstadoLote;

export interface LoteDTO {
  id: string;
  superficieM2: number;
  precio: number;
  estado: EstadoLote;
}

export type Lot = LoteDTO;

export const obtenerLotes = async (signal?: AbortSignal): Promise<LoteDTO[]> => {
  const respuesta = await fetch('/api/lots', { signal });

  if (!respuesta.ok) {
    throw new Error('No se pudo obtener la lista de lotes');
  }

  const data = (await respuesta.json()) as LoteDTO[];
  return data;
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
