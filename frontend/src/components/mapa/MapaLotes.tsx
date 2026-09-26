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

/**
 * Dimensiones de cotizadorFondo.webp, la ortofoto que va detrás de este mapa.
 * El SVG usa sus píxeles como sistema de coordenadas, así que los polígonos quedan
 * clavados sobre la imagen pase lo que pase con el tamaño del panel. Si se cambia la
 * imagen hay que cambiar estos dos números Y los polígonos.
 */
const MAPA_IMAGEN = { width: 2400, height: 1680 };

/**
 * Los 13 lotes, de izquierda a derecha, en píxeles de esa imagen. Salen de medir sobre
 * el propio render: las 12 divisiones que dibuja, más los cuatro bordes del predio.
 * Antes estaban en un espacio inventado (viewBox 370 180 500 550) que no tenía nada que
 * ver con el fondo, y por eso los lotes aparecían desplazados respecto a la foto.
 */
const LOT_PATHS = [
  "172,161 328,162 312,1482 157,1505",   // 1
  "328,162 485,162 472,1459 312,1482",   // 2
  "485,162 645,162 632,1435 472,1459",   // 3
  "645,162 805,162 794,1412 632,1435",   // 4
  "805,162 963,163 955,1388 794,1412",   // 5
  "963,163 1123,163 1114,1365 955,1388", // 6
  "1123,163 1284,163 1276,1342 1114,1365", // 7
  "1284,163 1447,164 1438,1318 1276,1342", // 8
  "1447,164 1605,164 1600,1295 1438,1318", // 9
  "1605,164 1767,164 1760,1271 1600,1295", // 10
  "1767,164 1929,165 1922,1248 1760,1271", // 11
  "1929,165 2093,165 2081,1225 1922,1248", // 12
  "2093,165 2216,165 2245,1201 2081,1225", // 13
];

/**
 * Los polígonos están dibujados de izquierda a derecha sobre la imagen, y sobre el
 * terreno el de la izquierda es el Lote 13 y el de la derecha el Lote 1.
 *
 * Antes se emparejaban por la posición del lote en la respuesta de la API. Eso funciona
 * mientras la API devuelva los lotes en ese mismo orden, pero deja de hacerlo en cuanto
 * no: en local, con el orden invertido, el mapa numeraba los lotes al revés. Sacar el
 * número del identificador («Lote 7» → 7) hace que cada polígono sea siempre el que le
 * toca, venga el listado como venga. Si el identificador no trae número, se cae al orden
 * de la lista, que es lo que se hacía siempre.
 */
const indiceDePoligono = (identificador: string, posicion: number, total: number) => {
  const numero = Number.parseInt(identificador.replace(/\D+/g, ''), 10);
  if (!Number.isFinite(numero) || numero < 1 || numero > total) return posicion;
  return total - numero;
};

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

  /**
   * El fondo dejó de ser un dibujo plano y pasó a ser una foto del terreno, todo verde.
   * El verde oliva de «disponible» encima de pasto verde no se distinguía, así que un
   * lote elegido se pinta con la tinta del panel: contrasta con el pasto y es el mismo
   * color que usa el resto del cotizador para «esto está seleccionado».
   */
  const getFill = (lote: Lote, seleccionado: boolean, hovered: boolean) => {
    const style = estadoStyles[lote.estado];
    if (lote.estado !== 'disponible') return hovered ? `${style.fill}CC` : `${style.fill}80`;
    if (seleccionado) return 'rgba(28, 37, 51, 0.55)';
    if (hovered) return 'rgba(255, 255, 255, 0.30)';
    return 'transparent';
  };

  const getStroke = (lote: Lote, seleccionado: boolean, hovered: boolean) => {
    const style = estadoStyles[lote.estado];
    if (seleccionado) return '#FFFFFF';
    if (lote.estado !== 'disponible') return style.stroke;
    if (hovered) return '#FFFFFF';
    return 'rgba(255, 255, 255, 0.45)';
  };

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full overflow-hidden">
      {/*
        El SVG ocupa exactamente la misma caja que la imagen del fondo y usa el mismo
        encuadre: viewBox en píxeles de la imagen y 'xMidYMid meet', que es el equivalente
        en SVG de object-fit:contain. Mientras las dos cosas coincidan, los polígonos no
        se pueden desalinear por mucho que cambie el tamaño del panel. Si aquí se toca
        el preserveAspectRatio, hay que tocar el object-fit de la imagen en
        MacroCotizadorPanel.
      */}
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${MAPA_IMAGEN.width} ${MAPA_IMAGEN.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g>
          {lotes.map((lote, index) => {
            const points = LOT_PATHS[indiceDePoligono(lote.id, index, LOT_PATHS.length)];
            if (!points) return null;

            const seleccionado = seleccionados.includes(lote.id);
            const esHovered = hoveredId === lote.id;

            return (
              <polygon
                key={lote.id}
                points={points}
                fill={getFill(lote, seleccionado, esHovered)}
                stroke={getStroke(lote, seleccionado, esHovered)}
                strokeWidth={seleccionado || esHovered ? 9 : 4}
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