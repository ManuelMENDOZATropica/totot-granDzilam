export type LotEstado = 'disponible' | 'vendido' | 'apartado';

export interface Lot {
  id: string;
  superficieM2: number;
  precio: number;
  estado: LotEstado;
}

export const lotsMock: Lot[] = [
  { id: 'Lote 1', superficieM2: 200, precio: 350000, estado: 'disponible' },
  { id: 'Lote 2', superficieM2: 210, precio: 367500, estado: 'disponible' },
  { id: 'Lote 3', superficieM2: 190, precio: 332500, estado: 'disponible' },
  { id: 'Lote 4', superficieM2: 220, precio: 385000, estado: 'apartado' },
  { id: 'Lote 5', superficieM2: 240, precio: 420000, estado: 'disponible' },
  { id: 'Lote 6', superficieM2: 180, precio: 315000, estado: 'vendido' },
  { id: 'Lote 7', superficieM2: 205, precio: 358750, estado: 'disponible' },
  { id: 'Lote 8', superficieM2: 215, precio: 376250, estado: 'disponible' },
  { id: 'Lote 9', superficieM2: 195, precio: 341250, estado: 'disponible' },
  { id: 'Lote 10', superficieM2: 225, precio: 393750, estado: 'disponible' },
  { id: 'Lote 11', superficieM2: 250, precio: 437500, estado: 'disponible' },
  { id: 'Lote 12', superficieM2: 230, precio: 402500, estado: 'apartado' },
  { id: 'Lote 13', superficieM2: 210, precio: 367500, estado: 'disponible' },
];
