import { ChangeEvent } from 'react';
import type { LotStatus } from '@/lib/api';

export interface LotsFilters {
  estatus: LotStatus | 'todos';
  superficieMin: number | '';
  superficieMax: number | '';
  query: string;
}

export interface FiltersBarProps {
  filters: LotsFilters;
  onFiltersChange: (filters: LotsFilters) => void;
}

const statusOptions: Array<{ label: string; value: LotsFilters['estatus'] }> = [
  { label: 'Todos', value: 'todos' },
  { label: 'Disponibles', value: 'disponible' },
  { label: 'Vendidos', value: 'vendido' },
  { label: 'Apartados', value: 'apartado' },
];

export const FiltersBar = ({ filters, onFiltersChange }: FiltersBarProps) => {
  const updateField = <K extends keyof LotsFilters>(key: K, value: LotsFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleNumericChange = (event: ChangeEvent<HTMLInputElement>, key: 'superficieMin' | 'superficieMax') => {
    const value = event.target.value;
    if (value === '') {
      updateField(key, '');
      return;
    }

    const parsed = Number.parseFloat(value);
    updateField(key, Number.isNaN(parsed) ? '' : parsed);
  };

  return (
    <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow shadow-slate-900/50">
      <div className="flex flex-1 flex-wrap gap-4">
        <label className="flex flex-col text-sm text-slate-200">
          Estatus
          <select
            className="mt-1 min-w-[150px] rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
            value={filters.estatus}
            onChange={(event) => updateField('estatus', event.target.value as LotsFilters['estatus'])}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm text-slate-200">
          Superficie mínima (m²)
          <input
            type="number"
            min={0}
            step={10}
            inputMode="numeric"
            className="mt-1 w-32 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
            value={filters.superficieMin}
            onChange={(event) => handleNumericChange(event, 'superficieMin')}
          />
        </label>

        <label className="flex flex-col text-sm text-slate-200">
          Superficie máxima (m²)
          <input
            type="number"
            min={0}
            step={10}
            inputMode="numeric"
            className="mt-1 w-32 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
            value={filters.superficieMax}
            onChange={(event) => handleNumericChange(event, 'superficieMax')}
          />
        </label>
      </div>

      <label className="flex flex-1 flex-col text-sm text-slate-200">
        Buscar por ID o manzana
        <input
          type="search"
          placeholder="Ej. L01-01 o M3"
          className="mt-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
          value={filters.query}
          onChange={(event) => updateField('query', event.target.value)}
        />
      </label>
    </section>
  );
};
