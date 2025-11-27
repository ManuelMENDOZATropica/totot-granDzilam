import { useState, useEffect, MouseEvent } from 'react';
import Image from 'next/image';

interface PublicLot {
  id: string;
  superficieM2: number;
  precio: number;
  estado: 'disponible' | 'vendido' | 'apartado';
  order: number;
}

// Coordenadas para la VISTA 1
const LOT_PATHS_V1 = [
  "390,200 425,200 425,700 390,720", // Lote 1
  "425,200 460,200 460,690 425,700", // Lote 2
  "460,200 495,200 495,680 460,690", // Lote 3
  "495,200 530,200 530,670 495,680", // Lote 4
  "530,200 565,200 565,660 530,670", // Lote 5
  "565,200 600,200 600,650 565,660", // Lote 6
  "600,200 635,200 635,640 600,650", // Lote 7
  "635,200 670,200 670,630 635,640", // Lote 8
  "670,200 705,200 705,620 670,630", // Lote 9
  "705,200 740,200 740,610 705,620", // Lote 10
  "740,200 775,200 775,600 740,610", // Lote 11
  "775,200 810,200 810,590 775,600", // Lote 12
  "810,200 845,200 845,580 810,590", // Lote 13
];

interface InteractiveMapProps {
  src: string;
  className?: string;
}

export const InteractiveMap = ({ src, className }: InteractiveMapProps) => {
  const [lots, setLots] = useState<PublicLot[]>([]);
  const [hoveredLot, setHoveredLot] = useState<PublicLot | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Detectamos si estamos en la vista que tiene mapeo (por ejemplo la vista 1)
  const isInteractiveView = src.includes('1.png') || src.includes('1.jpg');

  useEffect(() => {
    if (!isInteractiveView) return; 

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/lots`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setLots(data.items);
        }
      })
      .catch((err) => console.error("Error cargando lotes:", err));
  }, [isInteractiveView]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isInteractiveView) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);

  return (
    <div className={`relative w-full h-full ${className}`} onMouseMove={handleMouseMove}>
      {/* 1. Imagen de Fondo (Usando Next/Image con fill como en tu original) */}
      <Image
        src={src}
        alt="Plano aéreo"
        fill
        priority
        sizes="100vw"
        className="object-cover" // La clase de opacidad viene desde el padre en 'className'
      />

      {/* 2. SVG Superpuesto (Solo si es la vista interactiva) */}
      {isInteractiveView && (
        <svg 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 800" // IMPORTANTE: Ajustar al aspect ratio de tu imagen 1.png
          preserveAspectRatio="none"
        >
          <g className="pointer-events-auto">
            {lots.map((lot, index) => {
              const points = LOT_PATHS_V1[index];
              if (!points) return null;
              
              const isActive = hoveredLot?.id === lot.id;
              
              // Colores
              let fillColor = 'transparent';
              if (isActive) {
                if (lot.estado === 'disponible') fillColor = 'rgba(16, 185, 129, 0.4)';
                else if (lot.estado === 'apartado') fillColor = 'rgba(234, 179, 8, 0.4)';
                else if (lot.estado === 'vendido') fillColor = 'rgba(239, 68, 68, 0.4)';
              }

              return (
                <polygon
                  key={lot.id}
                  points={points}
                  fill={fillColor}
                  stroke={isActive ? "white" : "rgba(255,255,255,0.15)"}
                  strokeWidth={isActive ? "2" : "1"}
                  className="cursor-pointer transition-all duration-300"
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
          className="absolute z-50 pointer-events-none bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-slate-200 w-56 animate-in fade-in zoom-in duration-150"
          style={{ top: mousePos.y - 150, left: mousePos.x - 112 }}
        >
           {/* ... Contenido del tooltip (igual que antes) ... */}
           <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-slate-200"></div>
           <h3 className="font-bold text-xl text-slate-900 text-center mb-2">{hoveredLot.id}</h3>
           <div className="space-y-1 text-sm">
             <div className="flex justify-between"><span className="text-slate-500">Superficie:</span><span className="font-medium">{hoveredLot.superficieM2} m²</span></div>
             <div className="flex justify-between"><span className="text-slate-500">Precio:</span><span className="font-medium text-emerald-700">{formatPrice(hoveredLot.precio)}</span></div>
             <div className="text-center mt-2 font-bold uppercase text-xs tracking-wider text-slate-400">{hoveredLot.estado}</div>
           </div>
        </div>
      )}
    </div>
  );
};