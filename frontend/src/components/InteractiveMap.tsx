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
  "-40.26,-83.18 -34.00,-83.18 -34.90,83.28 -41.69,85.55",
  "-34.36,-83.18 -27.74,-83.18 -28.64,79.37 -34.90,82.61",
  "-27.74,-83.18 -21.48,-83.18 -22.38,76.76 -28.64,80.04",
  "-21.48,-83.18 -15.22,-83.18 -15.94,74.49 -22.38,77.10",
  "-15.22,-83.18 -8.96,-83.18 -9.68,71.25 -16.12,74.16",
  "-8.96,-83.18 -2.70,-83.18 -3.42,67.98 -9.86,71.25",
  "-2.70,-83.18 3.55,-83.18 2.66,64.70 -3.42,67.98",
  "3.55,-83.18 9.81,-83.18 9.10,62.10 3.02,64.70",
  "9.81,-83.18 16.07,-83.18 15.18,58.86 9.28,61.76",
  "16.07,-83.18 22.51,-83.18 21.79,56.25 15.54,59.19",
  "22.69,-83.18 28.94,-83.18 27.87,53.31 21.97,56.25",
  "29.12,-83.18 35.38,-83.18 34.31,50.40 28.23,52.98",
  "35.56,-83.18 41.10,-83.18 39.68,-47.09 40.21,-6.33 40.75,19.73 40.57,47.13 34.49,50.07",
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
  const anchorY = (MOBILE_VIEWBOX.height * 3) / 4;

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
            <g className="pointer-events-auto" transform={mapTranslate}>
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