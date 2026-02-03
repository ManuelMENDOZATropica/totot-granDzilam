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

// --- COORDENADAS DESKTOP (V1 ABSOLUTAS) ---
const LOT_PATHS_DESKTOP = [
  "390,200 425,200 420,698.2 382,705", "423,200 460,200 455,686.5 420,696.2",
  "460,200 495,200 490,678.7 455,688.5", "495,200 530,200 526,671.9 490,679.7",
  "530,200 565,200 561,662.2 525,670.9", "565,200 600,200 596,652.4 560,662.2",
  "600,200 635,200 630,642.6 596,652.4", "635,200 670,200 666,634.8 632,642.6",
  "670,200 705,200 700,625.1 667,633.8", "705,200 741,200 737,617.3 702,626.1",
  "742,200 777,200 771,608.5 738,617.3", "778,200 813,200 807,599.8 773,607.5",
  "814,200 845,200 837,308 840,430 843,508 842,590 808,598.8"
];

// --- COORDENADAS MOBILE (RELATIVAS CON UPDATE) ---
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

  // 1. Configuración de Viewbox y Transformación según plataforma
  const viewBox = isMobileView
    ? `0 0 ${MOBILE_VIEWBOX.width} ${MOBILE_VIEWBOX.height}`
    : `0 0 ${DESKTOP_VIEWBOX.width} ${DESKTOP_VIEWBOX.height}`;

  const mapPaths = isMobileView ? LOT_PATHS_MOBILE : LOT_PATHS_DESKTOP;

  // Lógica de transformación específica
  const anchorX = MOBILE_VIEWBOX.width / 2;
  const anchorY = (MOBILE_VIEWBOX.height * 9) / 10;

  const mapTransform = isMobileView
    ? `translate(${anchorX}, ${anchorY}) scale(2)` // Update Mobile
    : `translate(${DESKTOP_TRANSLATE.x}, ${DESKTOP_TRANSLATE.y})`; // Classic Desktop

  useEffect(() => {
    if (!isInteractive) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/lots`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setLots(data.items);
        } else {
          setLots([]);
        }
      })
      .catch((err) => console.error('Error cargando lotes:', err));
  }, [isInteractive]);

  const handlePolygonEnter = (event: MouseEvent<SVGPolygonElement>, lot: PublicLot) => {
    const polygonRect = event.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      setTooltipPos({
        x: polygonRect.left - containerRect.left + polygonRect.width / 2,
        y: isMobileView ? containerRect.height * 0.75 : polygonRect.top - containerRect.top,
      });
    }
    setHoveredLot(lot);
  };

  const getFillColor = (estado: string) => {
    const opacity = isMobileView ? 0.6 : 0.4;
    if (estado === 'disponible') return `rgba(16, 185, 129, ${opacity})`;
    if (estado === 'apartado') return `rgba(234, 179, 8, ${opacity})`;
    if (estado === 'vendido') return `rgba(239, 68, 68, ${opacity})`;
    return 'transparent';
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
              {lots.map((lot, index) => {
                const points = mapPaths[index];
                if (!points) return null;
                return (
                  <polygon
                    key={lot.id}
                    points={points}
                    fill={
                      hoveredLot?.id === lot.id
                        ? getFillColor(lot.estado)
                        : isMobileView
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'transparent'
                    }
                    stroke={
                      hoveredLot?.id === lot.id
                        ? 'white'
                        : isMobileView
                        ? 'rgba(0, 0, 0, 0.5)'
                        : 'transparent'
                    }
                    strokeWidth={hoveredLot?.id === lot.id ? (isMobileView ? '2' : '3') : '0'}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={(e) => handlePolygonEnter(e, lot)}
                    onMouseLeave={() => setHoveredLot(null)}
                  />
                );
              })}
            </g>
          </svg>
        )}

        {hoveredLot && (
          <div
            className="absolute z-[60] pointer-events-none bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200 w-64 animate-in fade-in zoom-in duration-150"
            style={{
              top: tooltipPos.y,
              left: tooltipPos.x,
              transform: isMobileView ? 'translate(-50%, -50%)' : 'translate(-50%, 50%)'
            }}
          >
            {!isMobileView && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-slate-200"></div>
            )}

            <div className="text-slate-800 text-center space-y-2">
              <h3 className="font-bold text-2xl">Lote {hoveredLot.id}</h3>
              <div className="flex justify-between text-sm px-2 py-1.5 bg-slate-50 rounded">
                <span className="text-slate-500">Superficie:</span>
                <span className="font-bold">{hoveredLot.superficieM2} m²</span>
              </div>
              <div className="flex justify-between text-sm px-2">
                <span className="text-slate-500">Precio:</span>
                <span className="font-bold text-emerald-700">{formatPrice(hoveredLot.precio)}</span>
              </div>
              <div className={`mt-2 block py-1.5 rounded-full text-xs font-black uppercase ${hoveredLot.estado === 'disponible' ? 'bg-emerald-100 text-emerald-700' :
                  hoveredLot.estado === 'apartado' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                {hoveredLot.estado}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
