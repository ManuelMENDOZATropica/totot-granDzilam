import { useMemo, useState } from 'react';
import type { Lote } from '@/hooks/useCotizacion';
import { formatearMoneda } from '@/lib/formatoMoneda';

interface MapaLotesProps {
  lotes: Lote[];
  seleccionados: string[];
  onToggle: (id: string) => void;
}

const estadoStyles: Record<
  Lote['estado'],
  { fill: string; stroke: string; text: string; badge: string }
> = {
  disponible: {
    fill: '#c2df9b',
    stroke: '#7a9350',
    text: 'text-slate-800',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  apartado: {
    fill: 'rgba(252, 215, 103, 0.45)',
    stroke: 'rgba(214, 164, 25, 0.85)',
    text: 'text-slate-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  vendido: {
    fill: 'rgba(146, 100, 60, 0.45)',
    stroke: 'rgba(107, 64, 33, 0.85)',
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

  const shapes = useMemo(() => {
    const total = 13;
    const gap = 16;
    const topWidth = 32;
    const bottomWidth = 44;
    const topY = 150;
    const bottomY = 520;
    const startX = 200;

    return Array.from({ length: total }, (_, index) => {
      const topLeftX = startX + index * (topWidth + gap);
      const topRightX = topLeftX + topWidth;
      const bottomLeftX = topLeftX - 8;
      const bottomRightX = bottomLeftX + bottomWidth;
      const id = `Lote ${index + 1}`;

      return {
        id,
        lote: lotesPorId.get(id),
        points: `${topLeftX},${topY} ${topRightX},${topY} ${bottomRightX},${bottomY} ${bottomLeftX},${bottomY}`,
      };
    }).filter((shape) => shape.lote);
  }, [lotesPorId]);

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
      return '#3f5517';
    }

    return estadoStyles.disponible.stroke;
  };

  const disponibles = lotes.filter((lote) => lote.estado === 'disponible').length;

  return (
    <section aria-labelledby="mapa-lotes" className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Disponibles</span>
            <span className="text-2xl font-semibold text-slate-900">{disponibles}</span>
          </div>
          <div className="h-10 w-px bg-slate-200" aria-hidden="true" />
          <div>
            <h2 id="mapa-lotes" className="text-lg font-semibold text-slate-900">
              Plano de lotes
            </h2>
            <p className="text-sm text-slate-500">Selecciona los lotes disponibles directamente en el plano.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          Selección activa
          <span className="rounded-full border border-emerald-100 bg-white px-2 py-0.5 text-emerald-700">
            {seleccionados.length}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-slate-300 bg-[#c2df9b]" aria-hidden="true" />
          Disponible
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-slate-300 bg-[#5b7a24]" aria-hidden="true" />
          Seleccionado
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[rgba(252,215,103,0.6)]" aria-hidden="true" />
          Apartado
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[rgba(146,100,60,0.6)]" aria-hidden="true" />
          Vendido
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
        <div className="aspect-[4/3] w-full">
          <svg className="h-full w-full" viewBox="0 0 960 680" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="terrenoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dbeac3" />
                <stop offset="100%" stopColor="#a1be6c" />
              </linearGradient>
            </defs>

            <g transform="rotate(-6 480 340)">
              <rect x="150" y="120" width="660" height="440" rx="28" fill="url(#terrenoGradient)" />
              <g opacity="0.85">
                <rect x="180" y="120" width="6" height="440" fill="rgba(255,255,255,0.35)" />
                <rect x="240" y="120" width="10" height="440" fill="rgba(255,255,255,0.25)" />
                <rect x="360" y="120" width="12" height="440" fill="rgba(255,255,255,0.3)" />
                <rect x="460" y="120" width="8" height="440" fill="rgba(255,255,255,0.25)" />
                <rect x="520" y="120" width="14" height="440" fill="rgba(255,255,255,0.28)" />
                <rect x="640" y="120" width="12" height="440" fill="rgba(255,255,255,0.3)" />
                <rect x="720" y="120" width="8" height="440" fill="rgba(255,255,255,0.2)" />
              </g>

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
                    className={`transition-all duration-200 ${
                      esDisponible ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-70'
                    }`}
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
        </div>

        {hoveredLote && (
          <div className="absolute bottom-4 right-4 z-10 w-60 rounded-xl border border-slate-200 bg-slate-50/95 p-4 backdrop-blur">
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
