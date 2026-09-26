export type LotEstado = 'disponible' | 'vendido' | 'apartado';

export interface Lot {
  id: string;
  superficieM2: number;
  precio: number;
  estado: LotEstado;
}

/**
 * Los 13 macro lotes reales, en el mismo orden que los sirve producción: de izquierda a
 * derecha sobre la ortofoto, o sea el Lote 13 primero y el Lote 1 al final.
 *
 * Antes esto era un fixture inventado (lotes de 180–250 m² a 1,750 MXN/m², numerados del
 * 1 al 13 de izquierda a derecha). Servía para arrancar, pero en local salían precios de
 * $350,000 donde producción cotiza $13,040,767, y la numeración del mapa aparecía
 * espejada respecto a la web real. Estas superficies y precios son los de la API de
 * producción; el precio es uniforme, 150 MXN/m².
 */
export const lotsMock: Lot[] = [
  { id: 'Lote 13', superficieM2: 86938.45, precio: 13040767.5, estado: 'vendido' },
  { id: 'Lote 12', superficieM2: 85399.2, precio: 12809880, estado: 'disponible' },
  { id: 'Lote 11', superficieM2: 83860, precio: 12579000, estado: 'disponible' },
  { id: 'Lote 10', superficieM2: 82320.8, precio: 12348120, estado: 'disponible' },
  { id: 'Lote 9', superficieM2: 80781.58, precio: 12117237, estado: 'disponible' },
  { id: 'Lote 8', superficieM2: 79242.64, precio: 11886396, estado: 'disponible' },
  { id: 'Lote 7', superficieM2: 77703.14, precio: 11655471, estado: 'disponible' },
  { id: 'Lote 6', superficieM2: 76163.92, precio: 11424588, estado: 'disponible' },
  { id: 'Lote 5', superficieM2: 74524.7, precio: 11178705, estado: 'disponible' },
  { id: 'Lote 4', superficieM2: 73085.5, precio: 10962825, estado: 'disponible' },
  { id: 'Lote 3', superficieM2: 71546.27, precio: 10731940.5, estado: 'disponible' },
  { id: 'Lote 2', superficieM2: 70007.05, precio: 10501057.5, estado: 'disponible' },
  { id: 'Lote 1', superficieM2: 61557.1, precio: 9233565, estado: 'apartado' },
];
