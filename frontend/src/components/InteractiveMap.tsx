import { useEffect, MouseEvent, useRef, useState } from 'react';
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

// Coordenadas
const LOT_PATHS_V1 = [
  "390,200 425,200 420,698.2 382,705",   // 1
  "423,200 460,200 455,686.5 420,696.2", // 2
  "460,200 495,200 490,678.7 455,688.5", // 3
  "495,200 530,200 526,671.9 490,679.7", // 4
  "530,200 565,200 561,662.2 525,670.9", // 5
  "565,200 600,200 596,652.4 560,662.2", // 6
  "600,200 635,200 630,642.6 596,652.4", // 7
  "635,200 670,200 666,634.8 632,642.6", // 8
  "670,200 705,200 700,625.1 667,633.8", // 9
  "705,200 741,200 737,617.3 702,626.1", // 10
  "742,200 777,200 771,608.5 738,617.3", // 11
  "778,200 813,200 807,599.8 773,607.5", // 12
  "814,200 845,200 837,308 840,430 843,508 842,590 808,598.8", // 13
];

const LOT_PATHS_V1_MOBILE = [
  "174.35,267.06 190.00,267.06 187.76,683.20 170.78,688.88",   // 1
  "189.11,267.06 205.65,267.06 203.41,673.43 187.76,681.53",   // 2
  "205.65,267.06 221.29,267.06 219.06,666.91 203.41,675.10",   // 3
  "221.29,267.06 236.94,267.06 235.15,661.23 219.06,667.75",   // 4
  "236.94,267.06 252.59,267.06 250.80,653.13 234.71,660.40",   // 5
  "252.59,267.06 268.24,267.06 266.45,644.95 250.35,653.13",   // 6
  "268.24,267.06 283.88,267.06 281.65,636.76 266.45,644.95",   // 7
  "283.88,267.06 299.53,267.06 297.74,630.24 282.54,636.76",   // 8
  "299.53,267.06 315.18,267.06 312.94,622.14 298.19,629.41",   // 9
  "315.18,267.06 331.27,267.06 329.48,615.63 313.84,622.98",   // 10
  "331.72,267.06 347.36,267.06 344.68,608.28 329.93,615.63",   // 11
  "347.81,267.06 363.46,267.06 360.78,601.01 345.58,607.44",   // 12
  "363.91,267.06 377.76,267.06 374.19,357.27 375.53,459.18 376.87,524.33 376.42,592.82 361.22,600.17", // 13
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

  const viewBox = isMobileInteractiveView
    ? `0 0 ${MOBILE_VIEWBOX.width} ${MOBILE_VIEWBOX.height}`
    : `0 0 ${DESKTOP_VIEWBOX.width} ${DESKTOP_VIEWBOX.height}`;
  const mapPaths = isMobileInteractiveView ? LOT_PATHS_V1_MOBILE : LOT_PATHS_V1;
  const preserveAspectRatio = isMobileInteractiveView ? 'xMidYMin meet' : 'none';
  const scaleX = MOBILE_VIEWBOX.width / DESKTOP_VIEWBOX.width;
  const scaleY = MOBILE_VIEWBOX.height / DESKTOP_VIEWBOX.height;
  const mapTranslate = isMobileInteractiveView
    ? `translate(${(DESKTOP_TRANSLATE.x * scaleX).toFixed(2)}, ${(DESKTOP_TRANSLATE.y * scaleY).toFixed(2)})`
    : `translate(${DESKTOP_TRANSLATE.x}, ${DESKTOP_TRANSLATE.y})`;

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
                    /* CAMBIO 1: Fondo blanco con transparencia, stroke negro suave cuando no seleccionado */
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

        {/* CAMBIO 2: Tooltip centrado horizontalmente y al 3/4 de la pantalla verticalmente */}
        {hoveredLot && isInteractiveView && (
          <div
            className="absolute z-[60] pointer-events-none bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200 w-64 animate-in fade-in zoom-in duration-150"
            style={{
              top: '75%',   /* 3/4 de la pantalla */
              left: '50%',  /* Centro horizontal */
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