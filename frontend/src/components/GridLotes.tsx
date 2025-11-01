import { memo } from 'react';
import clsx from 'clsx';
import type { Lot } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

export interface GridLotesProps {
  lots: Lot[];
  selectedIds: string[];
  onToggle: (lotId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const statusLabel: Record<Lot['estatus'], string> = {
  disponible: 'Disponible',
  vendido: 'Vendido',
  apartado: 'Apartado',
};

export const GridLotes = memo(({ lots, selectedIds, onToggle, loading, emptyMessage }: GridLotesProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-live="polite">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-lg border border-slate-800 bg-slate-800/60" />
        ))}
      </div>
    );
  }

  if (!lots.length) {
    return (
      <p className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-300" role="status">
        {emptyMessage ?? 'No hay lotes que cumplan tu búsqueda.'}
      </p>
    );
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="listbox"
      aria-multiselectable="true"
      aria-label="Listado de lotes disponibles"
      aria-live="polite"
    >
      {lots.map((lot) => {
        const isSelected = selectedIds.includes(lot.id);
        const isAvailable = lot.estatus === 'disponible';

        return (
          <button
            key={lot.id}
            type="button"
            className={clsx(
              'flex h-full flex-col gap-3 rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900',
              isSelected
                ? 'border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-900/40'
                : 'border-slate-800 bg-slate-900/80 hover:border-sky-400/60 hover:bg-slate-900',
              !isAvailable && 'cursor-not-allowed opacity-60',
            )}
            onClick={() => (isAvailable ? onToggle(lot.id) : undefined)}
            onKeyDown={(event) => {
              if ((event.key === 'Enter' || event.key === ' ') && isAvailable) {
                event.preventDefault();
                onToggle(lot.id);
              }
            }}
            aria-selected={isSelected}
            role="option"
            disabled={!isAvailable}
          >
            <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-slate-300">
              <span>{lot.id}</span>
              <span className="text-xs text-slate-400">{lot.manzana}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <p className="text-lg font-semibold text-slate-100">{lot.superficieM2} m²</p>
              <p className="text-base text-slate-200">{formatCurrency(lot.precio)}</p>
            </div>
            <div
              className={clsx(
                'mt-auto inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                isAvailable
                  ? 'bg-emerald-600/20 text-emerald-200'
                  : lot.estatus === 'apartado'
                    ? 'bg-amber-600/20 text-amber-200'
                    : 'bg-rose-600/20 text-rose-200',
              )}
            >
              {statusLabel[lot.estatus]}
            </div>
          </button>
        );
      })}
    </div>
  );
});

GridLotes.displayName = 'GridLotes';
