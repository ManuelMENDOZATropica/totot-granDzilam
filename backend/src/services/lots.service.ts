import type { Lot } from '../data/lots.mock';
import { lotsMock } from '../data/lots.mock';

export const fetchLots = async (): Promise<Lot[]> => {
  return lotsMock;
};
