export type LotStatus = 'disponible' | 'vendido' | 'apartado';

export interface Lot {
  id: string;
  manzana: string;
  superficieM2: number;
  precio: number;
  estatus: LotStatus;
}

const statusCycle: LotStatus[] = ['disponible', 'disponible', 'apartado', 'vendido'];

const baseManzanas = ['A', 'B', 'C', 'D', 'E', 'F'];

export const lotsMock: Lot[] = baseManzanas.flatMap((manzana, manzanaIndex) => {
  const basePrice = 210000 + manzanaIndex * 25000;
  const baseSurface = 160 + manzanaIndex * 8;

  return Array.from({ length: 12 }, (_, lotIndex) => {
    const status = statusCycle[(manzanaIndex + lotIndex) % statusCycle.length];
    const surface = baseSurface + (lotIndex % 5) * 12;
    const price = basePrice + lotIndex * 18000 + surface * 850;

    return {
      id: `L${(manzanaIndex + 1).toString().padStart(2, '0')}-${(lotIndex + 1)
        .toString()
        .padStart(2, '0')}`,
      manzana: `M${manzana}`,
      superficieM2: Math.round(surface),
      precio: Math.round(price / 100) * 100,
      estatus: status,
    } satisfies Lot;
  });
});
