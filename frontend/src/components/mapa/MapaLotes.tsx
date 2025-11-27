import { useMemo, useState } from 'react';
import type { Lote } from '@/hooks/useCotizacion';
import { formatearMoneda } from '@/lib/formatoMoneda';

interface MapaLotesProps {
  lotes: Lote[];
  seleccionados: string[];
  onToggle: (id: string) => void;
}

const LOT_SHAPES: Array<{ id: string; points: string }> = [
  { id: 'Lote 1', points: '390,200 425,200 425,700 390,720' },
  { id: 'Lote 2', points: '425,200 460,200 460,690 425,700' },
  { id: 'Lote 3', points: '460,200 495,200 495,680 460,690' },
  { id: 'Lote 4', points: '495,200 530,200 530,670 495,680' },
  { id: 'Lote 5', points: '530,200 565,200 565,660 530,670' },
  { id: 'Lote 6', points: '565,200 600,200 600,650 565,660' },
  { id: 'Lote 7', points: '600,200 635,200 635,640 600,650' },
  { id: 'Lote 8', points: '635,200 670,200 670,630 635,640' },
  { id: 'Lote 9', points: '670,200 705,200 705,620 670,630' },
  { id: 'Lote 10', points: '705,200 740,200 740,610 705,620' },
  { id: 'Lote 11', points: '740,200 775,200 775,600 740,610' },
  { id: 'Lote 12', points: '775,200 810,200 810,590 775,600' },
  { id: 'Lote 13', points: '810,200 845,200 845,580 810,590' },
];

const estadoStyles: Record<
  Lote['estado'],
  { fill: string; stroke: string; text: string; badge: string }
> = {
  disponible: {
    fill: '#b7d28b',
    stroke: '#6a7f3a',
    text: 'text-slate-800',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  apartado: {
    fill: 'rgba(234, 179, 8, 0.35)',
    stroke: 'rgba(202, 138, 4, 0.8)',
    text: 'text-slate-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  vendido: {
    fill: 'rgba(120, 69, 32, 0.35)',
    stroke: 'rgba(88, 41, 18, 0.8)',
    text: 'text-slate-600',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
  },
};

export const MapaLotes = ({ lotes, seleccionados, onToggle }: MapaLotesProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const lotesPorId = useMemo(() => {
    const mapa = new Map<string, Lote>();
    lotes.forEach((lote) => mapa.set(lote.id, lote));
    return mapa;
  }, [lotes]);

  const hoveredLote = hoveredId ? lotesPorId.get(hoveredId) ?? null : null;

  const shapes = useMemo(
    () =>
      LOT_SHAPES.map((shape) => ({
        ...shape,
        lote: lotesPorId.get(shape.id),
      })).filter((shape) => shape.lote),
    [lotesPorId],
  );

  const getFill = (lote: Lote, seleccionado: boolean) => {
    if (lote.estado !== 'disponible') {
      return estadoStyles[lote.estado].fill;
    }

    if (seleccionado) {
      return '#6b7c2e';
    }

    return estadoStyles.disponible.fill;
  };

  const getStroke = (lote: Lote, seleccionado: boolean) => {
    if (lote.estado !== 'disponible') {
      return estadoStyles[lote.estado].stroke;
    }

    if (seleccionado) {
      return '#4a5b1f';
    }

    return estadoStyles.disponible.stroke;
  };

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
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-slate-300 bg-[#b7d28b]" aria-hidden="true" />
            Disponible
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-slate-300 bg-[#6b7c2e]" aria-hidden="true" />
            Seleccionado
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-[rgba(234,179,8,0.6)]" aria-hidden="true" />
            Apartado
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-[rgba(120,69,32,0.6)]" aria-hidden="true" />
            Vendido
          </div>
        </div>
      </div>

      <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <svg className="h-full w-full" viewBox="0 0 1000 800" preserveAspectRatio="none">
          <defs>
            <linearGradient id="terrenoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c7dca5" />
              <stop offset="100%" stopColor="#90a95a" />
            </linearGradient>
          </defs>

          <g transform="translate(20, -65)">
            <rect x="300" y="150" width="520" height="650" rx="18" fill="url(#terrenoGradient)" transform="rotate(-12 560 475)" />
            <line x1="310" y1="150" x2="800" y2="800" stroke="rgba(255,255,255,0.7)" strokeWidth="6" transform="rotate(-12 555 475)" />

            {shapes.map((shape) => {
              const lote = shape.lote as Lote;
              const seleccionado = seleccionados.includes(lote.id);
              const esDisponible = lote.estado === 'disponible';

              return (
                <polygon
                  key={shape.id}
                  points={shape.points}
                  fill={getFill(lote, seleccionado)}
                  stroke={getStroke(lote, seleccionado)}
                  strokeWidth={seleccionado ? 3 : 1.5}
                  className={`transition-all duration-200 ${esDisponible ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-70'}`}
                  onClick={() => {
                    if (!esDisponible) return;
                    onToggle(lote.id);
                  }}
                  onMouseEnter={() => setHoveredId(lote.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <title>
                    {`${lote.id} • ${lote.superficieM2} m² • ${formatearMoneda(lote.precio)}${
                      esDisponible ? '' : ` (${lote.estado})`
                    }`}
                  </title>
                </polygon>
              );
            })}
          </g>
        </svg>

        {hoveredLote && (
          <div className="absolute bottom-4 right-4 z-10 w-60 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-slate-500">{hoveredLote.id}</p>
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${estadoStyles[hoveredLote.estado].badge}`}
              >
                {hoveredLote.estado}
              </span>
            </div>
            <dl className={`mt-2 space-y-1 text-sm ${estadoStyles[hoveredLote.estado].text}`}>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Superficie</dt>
                <dd className="font-semibold">{hoveredLote.superficieM2} m²</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Precio</dt>
                <dd className="font-semibold">{formatearMoneda(hoveredLote.precio)}</dd>
              </div>
            </dl>
            {hoveredLote.estado === 'disponible' && (
              <p className="mt-3 text-[12px] text-slate-500">Haz clic en el lote para agregarlo o quitarlo de tu selección.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
