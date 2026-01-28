import { useEffect, useRef, useState } from 'react';
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

// Coordenadas Absolutas Desktop
const LOT_PATHS_V1 = [
  "390,200 425,200 420,698.2 382,705",
  "423,200 460,200 455,686.5 420,696.2",
  "460,200 495,200 490,678.7 455,688.5",
  "495,200 530,200 526,671.9 490,679.7",
  "530,200 565,200 561,662.2 525,670.9",
  "565,200 600,200 596,652.4 560,662.2",
  "600,200 635,200 630,642.6 596,652.4",
  "635,200 670,200 666,634.8 632,642.6",
  "670,200 705,200 700,625.1 667,633.8",
  "705,200 741,200 737,617.3 702,626.1",
  "742,200 777,200 771,608.5 738,617.3",
  "778,200 813,200 807,599.8 773,607.5",
  "814,200 845,200 837,308 840,430 843,508 842,590 808,598.8",
];

// Coordenadas Relativas Mobile (Centro en 0,0)
const LOT_PATHS_MOBILE_RELATIVE = [
  "-80.52,-83.18 -68.00,-83.18 -69.80,0.02 -83.38,1.15",   // 1
  "-68.72,-83.18 -55.48,-83.18 -57.28,-1.93 -69.80,-0.31", // 2
  "-55.48,-83.18 -42.96,-83.18 -44.76,-3.24 -57.28,-1.60", // 3
  "-42.96,-83.18 -30.44,-83.18 -31.88,-4.37 -44.76,-3.07", // 4
  "-30.44,-83.18 -17.92,-83.18 -19.36,-5.99 -32.24,-4.54", // 5
  "-17.92,-83.18 -5.40,-83.18 -6.84,-7.63 -19.72,-5.99",   // 6
  "-5.40,-83.18 7.10,-83.18 5.32,-9.27 -6.84,-7.63",       // 7
  "7.10,-83.18 19.62,-83.18 18.20,-10.57 6.04,-9.27",      // 8
  "19.62,-83.18 32.14,-83.18 30.36,-12.19 18.56,-10.74",   // 9
  "32.14,-83.18 45.02,-83.18 43.58,-13.49 31.08,-12.02",   // 10
  "45.38,-83.18 57.88,-83.18 55.74,-14.96 43.94,-13.49",   // 11
  "58.24,-83.18 70.76,-83.18 68.62,-16.42 56.46,-15.13",   // 12
  "71.12,-83.18 82.20,-83.18 79.36,-59.27 80.42,-38.89 81.50,-25.85 81.14,-12.15 68.98,-10.68", // 13
];
interface InteractiveMapProps {
  src: string;
  className?: string;
  imageClassName?: string;
}

export const InteractiveMap = ({ src, className, imageClassName }: InteractiveMapProps) => {
  const imageClasses = ['object-cover select-none', imageClassName].filter(Boolean).join(' ');
  const [lots, setLots] = useState<PublicLot[]>([]);
  const [hoveredLot, setHoveredLot] = useState<PublicLot | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isDesktopInteractiveView = src.includes('1.png') || src.includes('1.jpg');
  const isMobileInteractiveView = src.includes('mobile1.png') || src.includes('mobile1.jpg');
  const isInteractiveView = isDesktopInteractiveView || isMobileInteractiveView;

  // 1. Definir Viewbox
  const viewBox = isMobileInteractiveView
    ? `0 0 ${MOBILE_VIEWBOX.width} ${MOBILE_VIEWBOX.height}`
    : `0 0 ${DESKTOP_VIEWBOX.width} ${DESKTOP_VIEWBOX.height}`;

  // 2. Definir Punto de Anclaje para Mobile (Centro 50%, Vertical 75%)
  const anchorX = MOBILE_VIEWBOX.width / 2;
  const anchorY = (MOBILE_VIEWBOX.height * 9) / 10;

  // 3. Transformación dinámica
  const mapTranslate = isMobileInteractiveView
    ? `translate(${anchorX}, ${anchorY})`
    : `translate(${DESKTOP_TRANSLATE.x}, ${DESKTOP_TRANSLATE.y})`;

  const mapPaths = isMobileInteractiveView ? LOT_PATHS_MOBILE_RELATIVE : LOT_PATHS_V1;
  const preserveAspectRatio = isMobileInteractiveView ? 'xMidYMin meet' : 'none';

  useEffect(() => {
    if (!isInteractiveView) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/lots`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) setLots(data.items);
      })
      .catch((err) => console.error("Error cargando lotes:", err));
  }, [isInteractiveView]);

  const getFillColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'rgba(16, 185, 129, 0.6)';
      case 'apartado': return 'rgba(234, 179, 8, 0.6)';
      case 'vendido': return 'rgba(239, 68, 68, 0.6)';
      default: return 'transparent';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
  };

  return (
    <div className={className}>
      <div ref={containerRef} className="relative h-full w-full">
        <Image
          src={src}
          alt="Mapa de lotes"
          fill
          priority
          className={imageClasses}
          sizes="100vw"
        />

        {isInteractiveView && (
          <svg
            className="absolute top-0 left-0 h-full w-full pointer-events-none z-[44]"
            viewBox={viewBox}
            preserveAspectRatio={preserveAspectRatio}
          >
            <g className="pointer-events-auto" transform={`${mapTranslate} scale(2)`}>
              {lots.map((lot, index) => {
                const points = mapPaths[index];
                if (!points) return null;
                const isHovered = hoveredLot?.id === lot.id;

                return (
                  <polygon
                    key={lot.id}
                    points={points}
                    fill={isHovered ? getFillColor(lot.estado) : 'rgba(255, 255, 255, 0.1)'}
                    stroke={isHovered ? "white" : "rgba(0, 0, 0, 0.5)"}
                    strokeWidth={isHovered ? "3" : "1"}
                    className="cursor-pointer transition-all duration-300 ease-in-out"
                    onMouseEnter={() => setHoveredLot(lot)}
                    onMouseLeave={() => setHoveredLot(null)}
                  />
                );
              })}
            </g>
          </svg>
        )}

        {hoveredLot && isInteractiveView && (
          <div
            className="absolute z-[60] pointer-events-none bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200 w-64 animate-in fade-in zoom-in duration-150"
            style={{
              top: '75%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="text-slate-800 text-center space-y-2">
              <h3 className="font-bold text-2xl text-slate-900 border-b border-slate-100 pb-1">
                Lote {hoveredLot.id}
              </h3>
              <div className="flex justify-between text-sm px-2 py-1.5 bg-slate-50 rounded">
                <span className="text-slate-500 font-medium">Superficie:</span>
                <span className="font-bold text-slate-700">{hoveredLot.superficieM2} m²</span>
              </div>
              <div className="flex justify-between text-sm px-2 py-1.5">
                <span className="text-slate-500 font-medium">Precio:</span>
                <span className="font-bold text-emerald-700">{formatPrice(hoveredLot.precio)}</span>
              </div>
              <div className={`mt-2 block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border
                ${hoveredLot.estado === 'disponible' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
                ${hoveredLot.estado === 'apartado' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                ${hoveredLot.estado === 'vendido' ? 'bg-red-100 text-red-700 border-red-200' : ''}
              `}>
                {hoveredLot.estado}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};