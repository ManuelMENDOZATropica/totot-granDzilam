export interface HealthResponse {
  status: string;
  timestamp: string;
}

export type LotStatus = 'disponible' | 'vendido' | 'apartado';

export interface Lot {
  id: string;
  manzana: string;
  superficieM2: number;
  precio: number;
  estatus: LotStatus;
}

export interface LotsQuery {
  page?: number;
  pageSize?: number;
  estatus?: LotStatus | 'todos';
  superficieMin?: number | null;
  superficieMax?: number | null;
  q?: string;
}

export interface LotsResponse {
  items: Lot[];
  page: number;
  pageSize: number;
  total: number;
}

export interface FinanceSimulationInput {
  lotIds: string[];
  porcentajeEnganche: number;
  meses: number;
}

export interface FinanceSimulationResult {
  totalSeleccionado: number;
  porcentajeEnganche: number;
  meses: number;
  enganche: number;
  saldoFinanciar: number;
  mensualidad: number;
}

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const fetchHealth = async (): Promise<HealthResponse> => {
  const response = await fetch(`${getBaseUrl()}/api/health`);

  if (!response.ok) {
    throw new Error('Failed to fetch health information');
  }

  return response.json();
};

const buildQueryParams = (query: LotsQuery) => {
  const params = new URLSearchParams();

  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.estatus && query.estatus !== 'todos') params.set('estatus', query.estatus);
  if (query.superficieMin != null) params.set('superficieMin', String(query.superficieMin));
  if (query.superficieMax != null) params.set('superficieMax', String(query.superficieMax));
  if (query.q) params.set('q', query.q);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchLots = async (query: LotsQuery = {}): Promise<LotsResponse> => {
  const url = `${getBaseUrl()}/api/lots${buildQueryParams(query)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('No se pudo obtener la lista de lotes');
  }

  return response.json();
};

export const simulateFinance = async (
  input: FinanceSimulationInput,
): Promise<FinanceSimulationResult> => {
  const response = await fetch(`${getBaseUrl()}/api/finance/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo simular el financiamiento');
  }

  return response.json();
};
