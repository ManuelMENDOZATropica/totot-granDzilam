import { useEffect, useRef, useState, MouseEvent } from 'react';
import Image from 'next/image';

interface PublicLot {
  id: string;
  superficieM2: number;
  precio: number;
  estado: 'disponible' | 'vendido' | 'apartado';
  order: number;
}

const DESKTOP_VIEWBOX = { width: 850, height: 680 };
const MOBILE_VIEWBOX = { width: 380, height: 568 };
const DESKTOP_TRANSLATE = { x: -312, y: -125 };

const LOT_PATHS_DESKTOP = [
  "390,200 425,200 420,698.2 382,705", "423,200 460,200 455,686.5 420,696.2",
  "460,200 495,200 490,678.7 455,688.5", "495,200 530,200 526,671.9 490,679.7",
  "530,200 565,200 561,662.2 525,670.9", "565,200 600,200 596,652.4 560,662.2",
  "600,200 635,200 630,642.6 596,652.4", "635,200 670,200 666,634.8 632,642.6",
  "670,200 705,200 700,625.1 667,633.8", "705,200 741,200 737,617.3 702,626.1",
  "742,200 777,200 771,608.5 738,617.3", "778,200 813,200 807,599.8 773,607.5",
  "814,200 845,200 837,308 840,430 843,508 842,590 808,598.8"
];

const LOT_PATHS_MOBILE = [
  "-80.52,-41.59 -68.00,-41.59 -69.80,41.64 -83.38,42.78", "-68.72,-41.59 -55.48,-41.59 -57.28,39.69 -69.80,41.31",
  "-55.48,-41.59 -42.96,-41.59 -44.76,38.38 -57.28,40.02", "-42.96,-41.59 -30.44,-41.59 -31.88,37.25 -44.76,38.55",
  "-30.44,-41.59 -17.92,-41.59 -19.36,35.63 -32.24,37.08", "-17.92,-41.59 -5.40,-41.59 -6.84,33.99 -19.72,35.63",
  "-5.40,-41.59 7.10,-41.59 5.32,32.35 -6.84,33.99", "7.10,-41.59 19.62,-41.59 18.20,31.05 6.04,32.35",
  "19.62,-41.59 32.14,-41.59 30.36,29.43 18.56,30.88", "32.14,-41.59 45.02,-41.59 43.58,28.13 31.08,29.60",
  "45.38,-41.59 57.88,-41.59 55.74,26.66 43.94,28.13", "58.24,-41.59 70.76,-41.59 68.62,25.20 56.46,26.49",
  "71.12,-41.59 82.20,-41.59 79.36,-23.55 80.42,-3.17 81.50,9.87 81.14,23.57 68.98,25.04"
];

export const InteractiveMap = ({ src, className, imageClassName }: { src: string; className?: string; imageClassName?: string }) => {
  const [lots, setLots] = useState<PublicLot[]>([]);
  const [hoveredLot, setHoveredLot] = useState<PublicLot | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isDesktopView = src.includes('1.png') || src.includes('1.jpg');
  const isMobileView = src.includes('mobile1.png') || src.includes('mobile1.jpg');
  const isInteractive = isDesktopView || isMobileView;

  const viewBox = isMobileView
    ? `0 0 ${MOBILE_VIEWBOX.width} ${MOBILE_VIEWBOX.height}`
    : `0 0 ${DESKTOP_VIEWBOX.width} ${DESKTOP_VIEWBOX.height}`;

  const mapPaths = isMobileView ? LOT_PATHS_MOBILE : LOT_PATHS_DESKTOP;
  const anchorX = MOBILE_VIEWBOX.width / 2;
  const anchorY = (MOBILE_VIEWBOX.height * 9) / 10;

  const mapTransform = isMobileView
    ? `translate(${anchorX}, ${anchorY}) scale(2)`
    : `translate(${DESKTOP_TRANSLATE.x}, ${DESKTOP_TRANSLATE.y})`;

  useEffect(() => {
    if (!isInteractive) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/lots`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) setLots(data.items);
      })
      .catch((err) => console.error('Error cargando lotes:', err));
  }, [isInteractive]);

  const handleInteraction = (event: MouseEvent<SVGPolygonElement> | React.TouchEvent<SVGPolygonElement>, lot: PublicLot) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // Obtener coordenadas del elemento (mouse o touch)
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;

    let targetX = clientX - containerRect.left;
    let targetY = clientY - containerRect.top;

    if (isMobileView) {
      const tooltipWidth = 192; // w-48
      const margin = 16;
      // Mantener horizontalmente dentro de la pantalla
      targetX = Math.max(tooltipWidth / 2 + margin, Math.min(containerRect.width - (tooltipWidth / 2 + margin), targetX));
      // En mobile, posicionar el globo arriba del punto de contacto para que el dedo no lo tape
      targetY = targetY - 120;
    } else {
      targetY = targetY - 10; // Desktop offset
    }

    setTooltipPos({ x: targetX, y: targetY });
    setHoveredLot(lot);
  };

  const getFillColor = (estado: string) => {
    const opacity = isMobileView ? 0.6 : 0.4;
    if (estado === 'disponible') return `rgba(16, 185, 129, ${opacity})`;
    if (estado === 'apartado') return `rgba(234, 179, 8, ${opacity})`;
    if (estado === 'vendido') return `rgba(239, 68, 68, ${opacity})`;
    return 'transparent';
  };

  return (
    <div className={className}>
      <div ref={containerRef} className="relative h-full w-full overflow-hidden touch-none">
        <Image src={src} alt="Mapa" fill priority className={`object-cover select-none ${imageClassName}`} sizes="100vw" />

        {isInteractive && (
          <svg className="absolute top-0 left-0 h-full w-full pointer-events-none z-[44]" viewBox={viewBox} preserveAspectRatio={isMobileView ? 'xMidYMin meet' : 'none'}>
            <g className="pointer-events-auto" transform={mapTransform}>
              {lots.map((lot, index) => (
                <polygon
                  key={lot.id}
                  points={mapPaths[index]}
                  fill={hoveredLot?.id === lot.id ? getFillColor(lot.estado) : isMobileView ? 'rgba(255, 255, 255, 0.05)' : 'transparent'}
                  stroke={hoveredLot?.id === lot.id ? 'white' : isMobileView ? 'rgba(255,255,255,0.2)' : 'transparent'}
                  strokeWidth={hoveredLot?.id === lot.id ? (isMobileView ? '1.5' : '3') : '0'}
                  className="cursor-pointer transition-colors duration-200"
                  onMouseEnter={(e) => !isMobileView && handleInteraction(e, lot)}
                  onMouseLeave={() => !isMobileView && setHoveredLot(null)}
                  onClick={(e) => isMobileView && handleInteraction(e, lot)}
                />
              ))}
            </g>
          </svg>
        )}

        {hoveredLot && (
          <div
            className={`absolute z-[60] pointer-events-none bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 transition-all duration-200 ease-out flex flex-col items-center
              ${isMobileView ? 'w-48 p-3' : 'w-64 p-4'}`}
            style={{
              top: tooltipPos.y,
              left: tooltipPos.x,
              transform: 'translate(-50%, -100%)', // Siempre crece hacia arriba del punto
              marginTop: '-10px'
            }}
          >
            <div className={`text-slate-800 text-center w-full ${isMobileView ? 'space-y-1' : 'space-y-2'}`}>
              <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1">
                <h3 className={`font-bold ${isMobileView ? 'text-base' : 'text-xl'}`}>Lote {hoveredLot.id}</h3>
                {isMobileView && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">Tap fuera para cerrar</span>}
              </div>

              <div className="flex justify-between text-[11px] sm:text-xs">
                <span className="text-slate-500 font-medium">Superficie:</span>
                <span className="font-bold text-slate-700">{hoveredLot.superficieM2} m²</span>
              </div>

              <div className="flex justify-between text-[11px] sm:text-xs">
                <span className="text-slate-500 font-medium">Precio:</span>
                <span className="font-bold text-emerald-600">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(hoveredLot.precio)}
                </span>
              </div>

              <div className={`mt-2 py-1 rounded-lg font-black uppercase tracking-wider ${isMobileView ? 'text-[9px]' : 'text-[10px]'} 
                ${hoveredLot.estado === 'disponible' ? 'bg-emerald-500 text-white' :
                  hoveredLot.estado === 'apartado' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                }`}>
                {hoveredLot.estado}
              </div>
            </div>
            {/* Flechita inferior */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 border-r border-b border-slate-200"></div>
          </div>
        )}
      </div>

      {/* Overlay transparente para cerrar el tooltip en mobile al tocar fuera */}
      {isMobileView && hoveredLot && (
        <div className="fixed inset-0 z-[50]" onClick={() => setHoveredLot(null)} />
      )}
    </div>
  );
};