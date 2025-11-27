import { useState, useEffect, MouseEvent, ChangeEvent } from 'react';
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
  "2643.03,953 2880.22,953 2880.22,3335.5 2643.03,3430.8", // 1
  "2880.22,953 3117.42,953 3117.42,3287.85 2880.22,3335.5", // 2
  "3117.42,953 3354.62,953 3354.62,3240.2 3117.42,3287.85", // 3
  "3354.62,953 3591.81,953 3591.81,3192.55 3354.62,3240.2", // 4
  "3591.81,953 3829.01,953 3829.01,3144.9 3591.81,3192.55", // 5
  "3829.01,953 4066.2,953 4066.2,3097.25 3829.01,3144.9", // 6
  "4066.2,953 4303.4,953 4303.4,3049.6 4066.2,3097.25", // 7
  "4303.4,953 4540.59,953 4540.59,3001.95 4303.4,3049.6", // 8
  "4540.59,953 4777.78,953 4777.78,2954.3 4540.59,3001.95", // 9
  "4777.78,953 5014.98,953 5014.98,2906.65 4777.78,2954.3", // 10
  "5014.98,953 5252.18,953 5252.18,2859 5014.98,2906.65", // 11
  "5252.18,953 5489.37,953 5489.37,2811.35 5252.18,2859", // 12
  "5489.37,953 5726.57,953 5726.57,2763.7 5489.37,2811.35", // 13
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
  const [svgOrigin, setSvgOrigin] = useState({ x: 0, y: 0 });

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

  const handleOriginChange = (axis: 'x' | 'y') => (event: ChangeEvent<HTMLInputElement>) => {
    setSvgOrigin((prev) => ({
      ...prev,
      [axis]: Number(event.target.value || 0),
    }));
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
          className="object-contain select-none"
          sizes="100vw"
        />

        {/* 2. SVG Superpuesto (Solo en vista 1) */}
        {isInteractiveView && (
          <svg
            className="absolute w-full h-full pointer-events-none"
            viewBox="0 0 1000 800"
            preserveAspectRatio="none"
            style={{ top: svgOrigin.y, left: svgOrigin.x }}
          >
            <g className="pointer-events-auto">
              {lots.map((lot, index) => {
                const points = LOT_PATHS_V1[index];
                if (!points) return null;

                return (
                  <polygon
                    key={lot.id}
                    points={points}
                    fill={hoveredLot?.id === lot.id ? getFillColor(lot.estado) : 'transparent'}
                    stroke={hoveredLot?.id === lot.id ? "white" : "rgba(255,255,255,0.2)"}
                    strokeWidth={hoveredLot?.id === lot.id ? "3" : "1"}
                    className="cursor-pointer transition-all duration-300 ease-in-out"
                    onMouseEnter={() => setHoveredLot(lot)}
                    onMouseLeave={() => setHoveredLot(null)}
                  />
                );
              })}
            </g>
          </svg>
        )}

        {/* 3. Control para ajustar la esquina superior izquierda del SVG */}
        {isInteractiveView && (
          <div className="absolute bottom-4 left-4 z-50 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow px-3 py-2 text-xs space-y-2">
            <div className="font-semibold text-slate-700">Origen del SVG (px)</div>
            <div className="flex gap-2">
              <label className="flex items-center gap-1">
                <span className="text-slate-500">X:</span>
                <input
                  type="number"
                  value={svgOrigin.x}
                  onChange={handleOriginChange('x')}
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-slate-800"
                />
              </label>
              <label className="flex items-center gap-1">
                <span className="text-slate-500">Y:</span>
                <input
                  type="number"
                  value={svgOrigin.y}
                  onChange={handleOriginChange('y')}
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-slate-800"
                />
              </label>
            </div>
          </div>
        )}

        {/* 4. Tooltip */}
        {hoveredLot && isInteractiveView && (
          <div
            className="absolute z-50 pointer-events-none bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200 w-56 animate-in fade-in zoom-in duration-150"
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

              <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
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