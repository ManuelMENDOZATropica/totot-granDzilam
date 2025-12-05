import { useState, useEffect, MouseEvent } from 'react';
import Image from 'next/image';

interface PublicLot {
  id: string;
  superficieM2: number;
  precio: number;
  estado: 'disponible' | 'vendido' | 'apartado';
  order: number;
}

// Coordenadas para la VISTA 1 (Ajustadas a tu imagen 1.png)
const LOT_PATHS_V1 = [
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

// INTERFAZ DE PROPS ACTUALIZADA
interface InteractiveMapProps {
  src: string;       // Recibe la imagen dinámica
  className?: string; // Recibe las clases de opacidad y posición
}

export const InteractiveMap = ({ src, className }: InteractiveMapProps) => {
  const [lots, setLots] = useState<PublicLot[]>([]);
  const [hoveredLot, setHoveredLot] = useState<PublicLot | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Solo mostramos los polígonos si estamos en la vista 1
  const isInteractiveView = src.includes('1.png') || src.includes('1.jpg');

  useEffect(() => {
    // Si no es la vista interactiva, no cargamos datos para ahorrar recursos
    if (!isInteractiveView) return;

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
      .catch((err) => console.error("Error cargando lotes:", err));
  }, [isInteractiveView]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isInteractiveView) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getFillColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'rgba(16, 185, 129, 0.4)';
      case 'apartado': return 'rgba(234, 179, 8, 0.4)';
      case 'vendido': return 'rgba(239, 68, 68, 0.4)';
      default: return 'transparent';
    }
  };  

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
  };

  return (
    <div className={className}>
      <div className="relative h-full w-full" onMouseMove={handleMouseMove}>

        {/* 1. Imagen de Fondo Dinámica */}
        <Image
          src={src}
          alt="Mapa de lotes"
          fill
          priority
          className="object-cover select-none"
          sizes="100vw"
        />

        {/* 2. SVG Superpuesto (Solo en vista 1) */}
        {isInteractiveView && (
          <svg
            className="absolute top-0 left-0 h-full w-full pointer-events-none z-[44]"
            viewBox="0 0 850 680"
            preserveAspectRatio="none"
          >
            <g className="pointer-events-auto" transform="translate(-312, -125)">
              {lots.map((lot, index) => {
                const points = LOT_PATHS_V1[index];
                if (!points) return null;

                return (
                  <polygon
                    key={lot.id}
                    points={points}
                    fill={hoveredLot?.id === lot.id ? getFillColor(lot.estado) : 'transparent'}
                    stroke={hoveredLot?.id === lot.id ? "white" : "transparent)"}
                    strokeWidth={hoveredLot?.id === lot.id ? "3" : "0"}
                    className="cursor-pointer transition-all duration-300 ease-in-out"
                    onMouseEnter={() => setHoveredLot(lot)}
                    onMouseLeave={() => setHoveredLot(null)}
                  />
                );
              })}
            </g>
          </svg>
        )}

        {/* 3. Tooltip */}
        {hoveredLot && isInteractiveView && (
          <div
            className="absolute z-[10] pointer-events-none bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200 w-56 animate-in fade-in zoom-in duration-150"
            style={{
              top: mousePos.y - 140,
              left: mousePos.x - 112
            }}
          >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-slate-200"></div>

            <div className="text-slate-800 text-center space-y-1">
              <h3 className="font-bold text-xl text-slate-900">{hoveredLot.id}</h3>

              <div className="flex justify-between text-sm px-2 py-1 bg-slate-50 rounded">
                <span className="text-slate-500">Superficie:</span>
                <span className="font-semibold">{hoveredLot.superficieM2} m²</span>
              </div>

              <div className="flex justify-between text-sm px-2">
                <span className="text-slate-500">Precio:</span>
                <span className="font-semibold text-emerald-700">{formatPrice(hoveredLot.precio)}</span>
              </div>

              <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-0
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