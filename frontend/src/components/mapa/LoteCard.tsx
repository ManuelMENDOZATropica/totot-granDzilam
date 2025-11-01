import type { Lote } from '@/hooks/useCotizacion';
import { formatearMoneda } from '@/lib/formatoMoneda';

interface LoteCardProps {
  lote: Lote;
  seleccionado: boolean;
  onToggle: (id: string) => void;
}

const estilosPorEstado: Record<Lote['estado'], string> = {
  disponible: 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900',
  vendido: 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed',
  apartado: 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed',
};

export const LoteCard = ({ lote, seleccionado, onToggle }: LoteCardProps) => {
  const { id, superficieM2, precio, estado } = lote;
  const tooltip = `${id} • ${superficieM2} m² • ${formatearMoneda(precio)}`;
  const esDisponible = estado === 'disponible';

  return (
    <button
      type="button"
      onClick={() => esDisponible && onToggle(id)}
      className={`flex aspect-[3/2] w-full items-center justify-center rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        seleccionado ? 'border-sky-400 bg-gran-sky text-slate-900' : estilosPorEstado[estado]
      }`}
      title={tooltip}
      aria-pressed={seleccionado}
      aria-label={`Lote ${id}${esDisponible ? '' : ' no disponible'}`}
      disabled={!esDisponible}
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-current">{id}</span>
    </button>
  );
};
