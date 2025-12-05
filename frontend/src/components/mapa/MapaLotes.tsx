import { useState, useRef, useEffect } from 'react';
import type { Lote } from '@/hooks/useCotizacion';

interface MapaLotesProps {
  lotes: Lote[];
  seleccionados: string[];
  onToggle: (id: string) => void;
}

// Estilos refinados para coincidir con la paleta "Luxury/Architectural"
const estadoStyles: Record<
  Lote['estado'],
  { fill: string; stroke: string; label: string }
> = {
  disponible: {
    fill: '#6A8035', // Verde Olivo (como en la imagen original)
    stroke: '#485822',
    label: 'Disponible',
  },
  apartado: {
    fill: '#D97706', // Ámbar
    stroke: '#92400E',
    label: 'Apartado',
  },
  vendido: {
    fill: '#9F1239', // Rose/Vino
    stroke: '#881337',
    label: 'Vendido',
  },
};

const LOT_PATHS = [
  "390,200 425,200 425,700 390,720", // 1
  "425,200 460,200 460,690 425,700", // 2
  "460,200 495,200 495,680 460,690", // 3
  "495,200 530,200 530,670 495,680", // 4
  "530,200 565,200 565,660 530,670", // 5
  "565,200 600,200 600,650 565,660", // 6
  "600,200 635,200 635,640 600,650", // 7
  "635,200 670,200 670,630 635,640", // 8
  "670,200 705,200 705,620 670,630", // 9
  "705,200 740,200 740,610 705,620", // 10
  "740,200 775,200 775,600 740,610", // 11
  "775,200 810,200 810,590 775,600", // 12
  "810,200 845,200 845,580 810,590", // 13
];

export const MapaLotes = ({ lotes, seleccionados, onToggle }: MapaLotesProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // Estado para el mensaje flotante de error/aviso
  const [alerta, setAlerta] = useState<{ x: number; y: number; mensaje: string; tipo: 'vendido' | 'apartado' } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Limpiar alerta después de unos segundos
  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [alerta]);

  const handleLotClick = (e: React.MouseEvent, lote: Lote) => {
    e.stopPropagation(); // Evitar burbujeo
    
    if (lote.estado === 'disponible') {
      onToggle(lote.id);
      setAlerta(null); // Limpiar alertas si selecciono uno bueno
    } else {
      // Calcular posición relativa al contenedor para mostrar el tooltip
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
    
    // 1. Estados no disponibles (siempre visibles, pero tenues)
    if (lote.estado !== 'disponible') {
      return hovered ? style.fill : `${style.fill}66`; // 66 es aprox 40% opacidad hex
    }

    // 2. Disponible y Seleccionado (Color sólido fuerte, como la imagen)
    if (seleccionado) return style.fill;

    // 3. Disponible y Hover (Color sólido medio)
    if (hovered) return `${style.fill}CC`; // 80% opacidad

    // 4. Disponible sin interacción (Transparente o muy sutil)
    return 'transparent';
  };

  const getStroke = (lote: Lote, seleccionado: boolean, hovered: boolean) => {
    const style = estadoStyles[lote.estado];
    
    // Si está seleccionado, borde muy oscuro
    if (seleccionado) return '#1C2533'; 

    // Si es hovered o no disponible, usar su color de borde
    if (hovered || lote.estado !== 'disponible') return style.stroke;

    // Por defecto (disponible sin hover), borde sutil para mostrar el contorno
    return '#A1A1AA'; 
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden border border-[#F3F1EC] z-[99] "
      style={{ backgroundColor: '#F3F1EC' }} // Fondo crema
    >
      
      {/* --- SVG MAPA --- */}
      <div className="flex aspect-[5/4] w-full items-center justify-center">
        <svg 
          className="h-full w-full touch-pan-x touch-pan-y" 
          viewBox="0 0 1000 800" 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Sombra suave para dar profundidad al "suelo" */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g transform="translate(-117, -60)">
            {lotes.map((lote, index) => {
              const points = LOT_PATHS[index];
              if (!points) return null;

              const seleccionado = seleccionados.includes(lote.id);
              const esHovered = hoveredId === lote.id;
              
              return (
                <g key={lote.id}>
                  <polygon
                    points={points}
                    fill={getFill(lote, seleccionado, esHovered)}
                    stroke={getStroke(lote, seleccionado, esHovered)}
                    strokeWidth={seleccionado ? 3 : 1.5}
                    // Animación suave de colores
                    className="transition-all duration-300 ease-out"
                    style={{
                      cursor: lote.estado === 'disponible' ? 'pointer' : 'not-allowed',
                      // Si está seleccionado, añadimos una pequeña sombra proyectada SVG (filter)
                      filter: seleccionado ? 'drop-shadow(3px 5px 4px rgba(0,0,0,0.2))' : 'none'
                    }}
                    
                    // Eventos
                    onClick={(e) => handleLotClick(e, lote)}
                    onMouseEnter={() => setHoveredId(lote.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                  
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* --- TOOLTIP / LEYENDA FLOTANTE AL CLICK --- */}
      {alerta && (
        <div 
          className="absolute z-10 flex max-w-[200px] flex-col gap-1 rounded-lg bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: Math.min(alerta.x, (containerRef.current?.offsetWidth || 500) - 210), // Evitar que se salga a la derecha
            top: alerta.y - 80 // Mostrar un poco arriba del click
          }}
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
             <span className={`h-2 w-2 rounded-full ${alerta.tipo === 'vendido' ? 'bg-rose-600' : 'bg-amber-500'}`} />
             <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
               {alerta.tipo}
             </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            {alerta.mensaje}
          </p>
          {/* Triángulo indicador (flechita abajo) */}
          <div className="absolute -bottom-2 left-4 h-4 w-4 rotate-45 bg-white" />
        </div>
      )}

    

    </div>
  );
};

export default MapaLotes;