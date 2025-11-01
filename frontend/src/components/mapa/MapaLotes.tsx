import type { Lote } from '@/hooks/useCotizacion';
import { LoteCard } from './LoteCard';

interface MapaLotesProps {
  lotes: Lote[];
  seleccionados: string[];
  onToggle: (id: string) => void;
}

export const MapaLotes = ({ lotes, seleccionados, onToggle }: MapaLotesProps) => {
  return (
    <section aria-labelledby="mapa-lotes" className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="mapa-lotes" className="text-lg font-semibold text-slate-900">
              Plano de lotes
            </h2>
            <p className="text-sm text-slate-500">Selecciona los lotes disponibles directamente en el plano.</p>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-400">
            <span>Seleccionados</span>
            <span className="text-base font-semibold text-slate-900">{seleccionados.length}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-slate-300" aria-hidden="true" />
            Disponible
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-slate-300 bg-gran-sky" aria-hidden="true" />
            Seleccionado
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-200" aria-hidden="true" />
            Apartado / Vendido
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-13">
        {lotes.map((lote) => (
          <LoteCard
            key={lote.id}
            lote={lote}
            seleccionado={seleccionados.includes(lote.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
};
