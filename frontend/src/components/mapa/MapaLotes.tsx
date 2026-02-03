import { useState, useRef, useEffect } from 'react';
import type { Lote } from '@/hooks/useCotizacion';

interface MapaLotesProps {
  lotes: Lote[];
  seleccionados: string[];
  onToggle: (id: string) => void;
}

const estadoStyles: Record<
  Lote['estado'],
  { fill: string; stroke: string; label: string }
> = {
  disponible: {
    fill: '#6A8035',
    stroke: '#485822',
    label: 'Disponible',
  },
  apartado: {
    fill: '#D97706',
    stroke: '#92400E',
    label: 'Apartado',
  },
  vendido: {
    fill: '#9F1239',
    stroke: '#881337',
    label: 'Vendido',
  },
};

const LOT_PATHS = [
  "390,200 425,200 420,695.5 382,705",   // 1
  "423,200 460,200 455,686.8 420,695.5", // 2
  "460,200 495,200 490,678.0 455,686.8", // 3
  "495,200 530,200 526,669.0 490,678.0", // 4
  "530,200 565,200 561,660.3 526,669.0", // 5
  "565,200 600,200 596,651.5 561,660.3", // 6
  "600,200 635,200 630,643.0 596,651.5", // 7
  "635,200 670,200 666,634.0 630,643.0", // 8
  "670,200 705,200 702,625.0 666,634.0", // 9
  "705,200 741,200 738,616.0 702,625.0", // 10
  "742,200 777,200 773,607.3 738,616.0", // 11
  "778,200 813,200 808,598.5 773,607.3", // 12
  "814,200 845,200 837,308 840,430 843,508 842,590 808,598.5", // 13
];

export const MapaLotes = ({ lotes, seleccionados, onToggle }: MapaLotesProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [alerta, setAlerta] = useState<{ x: number; y: number; mensaje: string; tipo: 'vendido' | 'apartado' } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [alerta]);

  const handleLotClick = (e: React.MouseEvent, lote: Lote) => {
    e.stopPropagation();
    if (lote.estado === 'disponible') {
      onToggle(lote.id);
      setAlerta(null);
    } else {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const mensaje = lote.estado === 'vendido'
          ? 'Este lote ya ha sido vendido.'
          : 'Este lote se encuentra apartado temporalmente.';
        setAlerta({ x, y, mensaje, tipo: lote.estado });
      }
    }
  };

  const getFill = (lote: Lote, seleccionado: boolean, hovered: boolean) => {
    const style = estadoStyles[lote.estado];
    if (lote.estado !== 'disponible') return hovered ? style.fill : `${style.fill}66`;
    if (seleccionado) return style.fill;
    if (hovered) return `${style.fill}CC`;
    return 'transparent';
  };

  const getStroke = (lote: Lote, seleccionado: boolean, hovered: boolean) => {
    const style = estadoStyles[lote.estado];
    if (seleccionado) return '#1C2533';
    if (hovered || lote.estado !== 'disponible') return style.stroke;
    return '#A1A1AA';
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-[600px] w-full items-center justify-center overflow-hidden bg-slate-50/30 p-4"
    >
      {/* Ajuste de viewBox:
          Inicia en X=370 para dar aire al primer lote (382).
          Inicia en Y=180 para dar aire arriba (200).
          Ancho 500 y Alto 550 cubre perfectamente todo el desarrollo.
      */}
      <svg
        className="h-full max-h-[90vh] w-full transition-transform duration-500"
        viewBox="370 180 500 550"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g>
          {lotes.map((lote, index) => {
            const points = LOT_PATHS[index];
            if (!points) return null;

            const seleccionado = seleccionados.includes(lote.id);
            const esHovered = hoveredId === lote.id;

            return (
              <polygon
                key={lote.id}
                points={points}
                fill={getFill(lote, seleccionado, esHovered)}
                stroke={getStroke(lote, seleccionado, esHovered)}
                strokeWidth={seleccionado ? 3 : 1.2}
                className="transition-all duration-300 ease-in-out"
                style={{
                  cursor: lote.estado === 'disponible' ? 'pointer' : 'not-allowed',
                  filter: seleccionado ? 'url(#glow)' : 'none',
                }}
                onClick={(e) => handleLotClick(e, lote)}
                onMouseEnter={() => setHoveredId(lote.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            );
          })}
        </g>
      </svg>

      {/* --- ALERTA FLOTANTE --- */}
      {alerta && (
        <div
          className="absolute z-[100] flex max-w-[200px] flex-col gap-1 rounded-lg bg-white p-3 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: Math.min(alerta.x, (containerRef.current?.offsetWidth || 500) - 210),
            top: alerta.y - 90
          }}
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
            <span className={`h-2 w-2 rounded-full ${alerta.tipo === 'vendido' ? 'bg-rose-600' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
              {alerta.tipo}
            </span>
          </div>
          <p className="text-[11px] leading-tight text-slate-600">
            {alerta.mensaje}
          </p>
          <div className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-white shadow-sm" />
        </div>
      )}
    </div>
  );
};

export default MapaLotes;