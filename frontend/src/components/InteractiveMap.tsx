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

  const handleLotInteraction = (event: MouseEvent<SVGPolygonElement>, lot: PublicLot) => {
    if (!isMobileView) {
      const polygonRect = event.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setTooltipPos({
          x: polygonRect.left - containerRect.left + polygonRect.width / 2,
          y: polygonRect.top - containerRect.top,
        });
      }
    }
    setHoveredLot(lot);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
  };

  return (
    <div className={className}>
      <div ref={containerRef} className="relative h-full w-full overflow-hidden">
        <Image src={src} alt="Mapa" fill priority className={`object-cover select-none ${imageClassName}`} sizes="100vw" />

        {isInteractive && (
          <svg
            className="absolute top-0 left-0 h-full w-full pointer-events-none z-[44]"
            viewBox={viewBox}
            preserveAspectRatio={isMobileView ? 'xMidYMin meet' : 'none'}
          >
            <g className="pointer-events-auto" transform={mapTransform}>
              {lots.map((lot, index) => (
                <polygon
                  key={lot.id}
                  points={mapPaths[index]}
                  fill={hoveredLot?.id === lot.id ?
                    (lot.estado === 'disponible' ? 'rgba(16, 185, 129, 0.5)' : lot.estado === 'apartado' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(239, 68, 68, 0.5)')
                    : 'transparent'}
                  // Borde blanco siempre presente en mobile cuando se selecciona
                  stroke={hoveredLot?.id === lot.id ? 'white' : 'transparent'}
                  strokeWidth={hoveredLot?.id === lot.id ? (isMobileView ? '1.5' : '3') : '0'}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={(e) => !isMobileView && handleLotInteraction(e, lot)}
                  onMouseLeave={() => !isMobileView && setHoveredLot(null)}
                  onClick={(e) => isMobileView && handleLotInteraction(e, lot)}
                />
              ))}
            </g>
          </svg>
        )}

        {hoveredLot && (
          <div
            className={`absolute z-[60] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 animate-in fade-in duration-300
              ${isMobileView
                ? 'top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] p-3'
                : 'w-64 p-4'
              }`}
            style={!isMobileView ? {
              top: tooltipPos.y,
              left: tooltipPos.x,
              transform: 'translate(-50%, -115%)'
            } : {}}
          >
            {isMobileView && (
              <button
                onClick={() => setHoveredLot(null)}
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
              >
                ✕
              </button>
            )}

            <div className="text-slate-800 space-y-2">
              <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Información del Lote</span>
                <h3 className="font-black text-2xl leading-none">#{hoveredLot.id}</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-50 p-2 rounded-lg text-center text-slate-700">
                  <p className="text-[9px] text-slate-500 uppercase">Superficie</p>
                  <p className="font-bold text-sm">{hoveredLot.superficieM2} m²</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center border-b-2 text-slate-700"
                  style={{ borderColor: hoveredLot.estado === 'disponible' ? '#10b981' : hoveredLot.estado === 'apartado' ? '#eab308' : '#ef4444' }}>
                  <p className="text-[9px] text-slate-500 uppercase">Estado</p>
                  <p className={`font-black text-[10px] uppercase ${hoveredLot.estado === 'disponible' ? 'text-emerald-600' :
                      hoveredLot.estado === 'apartado' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                    {hoveredLot.estado}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl">
                <span className="text-white/70 text-[10px] uppercase font-bold">Precio</span>
                <span className="text-white font-bold text-lg">{formatPrice(hoveredLot.precio)}</span>
              </div>
            </div>

            {!isMobileView && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-slate-200"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};