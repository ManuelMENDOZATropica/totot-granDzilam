import { useEffect, useRef, useState, MouseEvent, useCallback, CSSProperties } from 'react';
import Image from 'next/image';

interface PublicLot {
  id: string;
  superficieM2: number;
  precio: number;
  estado: 'disponible' | 'vendido' | 'apartado';
  order: number;
}

const DESKTOP_VIEWBOX = { width: 850, height: 680 };
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
  /* Lote  1 */ "-80.52,-41.59 -68.00,-41.59 -69.80,38.25 -83.38,39.89",
  /* Lote  2 */ "-68.72,-41.59 -55.48,-41.59 -57.28,36.75 -69.80,38.25",
  /* Lote  3 */ "-55.48,-41.59 -42.96,-41.59 -44.76,35.24 -57.28,36.75",
  /* Lote  4 */ "-42.96,-41.59 -30.44,-41.59 -31.88,33.70 -44.76,35.24",
  /* Lote  5 */ "-30.44,-41.59 -17.92,-41.59 -19.36,32.20 -32.24,33.74",
  /* Lote  6 */ "-17.92,-41.59  -5.40,-41.59  -6.84,30.69 -19.72,32.24",
  /* Lote  7 */  "-5.40,-41.59   7.10,-41.59   5.32,29.23  -6.84,30.69",
  /* Lote  8 */  "7.10,-41.59  19.62,-41.59  18.20,27.68   6.04,29.14",
  /* Lote  9 */ "19.62,-41.59  32.14,-41.59  30.36,26.22  18.56,27.64",
  /* Lote 10 */ "32.14,-41.59  45.02,-41.59  43.58,24.64  31.08,26.14",
  /* Lote 11 */ "45.38,-41.59  57.88,-41.59  55.74,23.18  43.94,24.59",
  /* Lote 12 */ "58.24,-41.59  70.76,-41.59  68.62,21.63  56.46,23.09",
  /* Lote 13 */ "71.12,-41.59  82.20,-41.59  79.36,-23.55  80.42,-3.17  81.50,9.87  81.14,18.96  68.98,21.58",
];

/** Dimensiones reales de mobile1.png */
const MOBILE_IMAGE = { width: 1024, height: 1536 };
export const InteractiveMap = ({ src, className, imageClassName }: { src: string; className?: string; imageClassName?: string }) => {
  const [lots, setLots] = useState<PublicLot[]>([]);
  const [hoveredLot, setHoveredLot] = useState<PublicLot | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Estilo calculado dinámicamente para el SVG móvil
  const [mobileSvgStyle, setMobileSvgStyle] = useState<CSSProperties>(
    { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }
  );

  const isDesktopView = src.includes('1.png') || src.includes('1.jpg');
  const isMobileView = src.includes('mobile1.png') || src.includes('mobile1.jpg');
  const isInteractive = isDesktopView || isMobileView;

  const viewBox = isMobileView
    ? `0 0 1024 1536`
    : `0 0 ${DESKTOP_VIEWBOX.width} ${DESKTOP_VIEWBOX.height}`;

  const mapPaths = isMobileView ? LOT_PATHS_MOBILE : LOT_PATHS_DESKTOP;

  // Transform en móvil mapea las coordenadas de los paths (-80..80) al espacio 1024x1536.
  // Escala empírica para igualar la imagen de fondo: scale = 4.288
  // Y base para coincidir con la diagonal de la imagen = 1071.4
  const mapTransform = isMobileView
    ? `translate(512, 1071.4) scale(4.288)`
    : `translate(${DESKTOP_TRANSLATE.x}, ${DESKTOP_TRANSLATE.y})`;

  /**
   * Calcula el style del SVG móvil para que sea una CAPA IDÉNTICA 1:1 sobre la imagen
   * renderizada (incluyendo sus partes invisibles o recortadas por object-cover).
   * Al hacer esto, las coordenadas del SVG (0 a 1024) son exactamente los pixeles
   * de la imagen, garantizando que NUNCA se desalineen sin importar la pantalla.
   */
  const updateMobileSvgStyle = useCallback(() => {
    if (!isMobileView || !containerRef.current) return;
    const { offsetWidth: containerW, offsetHeight: containerH } = containerRef.current;

    // Fórmula estándar de object-cover
    const imageScale = Math.max(
      containerW / MOBILE_IMAGE.width,
      containerH / MOBILE_IMAGE.height,
    );

    // Dimensiones reales en pixeles que ocupa la imagen escalada
    const renderedImageW = MOBILE_IMAGE.width * imageScale;
    const renderedImageH = MOBILE_IMAGE.height * imageScale;

    // Si la imagen excede el contenedor, tiene un offset negativo (recorte)
    const imageLeft = (containerW - renderedImageW) / 2;
    const imageTop = (containerH - renderedImageH) / 2;

    setMobileSvgStyle({
      position: 'absolute',
      top: imageTop,
      left: imageLeft,
      width: renderedImageW,
      height: renderedImageH
    });
  }, [isMobileView]);

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

  // ResizeObserver: recalcula el posicionamiento del SVG móvil al cambiar el tamaño
  useEffect(() => {
    if (!isMobileView) return;
    updateMobileSvgStyle();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateMobileSvgStyle);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobileView, updateMobileSvgStyle]);


  const handleInteraction = (event: MouseEvent<SVGPolygonElement>, lot: PublicLot) => {
    if (!isMobileView) {
      const polygonRect = event.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setTooltipPos({
          x: polygonRect.left - containerRect.left + polygonRect.width / 2,
          y: 0,
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
            className="pointer-events-none z-[44]"
            viewBox={viewBox}
            // En móvil: posición calculada dinámicamente (ancho=100%, fondo anclado al centro).
            // En desktop: cubre todo el contenedor sin escala uniforme.
            style={isMobileView
              ? mobileSvgStyle
              : { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }
            }
            // 'none': el SVG tiene exactamente la misma proporción que el viewBox (por cálculo),
            // así que no hay distorsión aunque no haya preservación de aspecto.
            preserveAspectRatio={isMobileView ? 'none' : 'none'}
          >
            <g className="pointer-events-auto" transform={mapTransform}>
              {isMobileView && (
                // Línea inferior de referencia. Desde Lote 1 (-83.38, 39.89) hasta Lote 13 (81.14, 18.96)
                // strokeWidth = 5 / 4.288 para compensar el scaling del transform y verse de 5px.
                <line x1="-83.38" y1="39.89" x2="81.14" y2="18.96" stroke="black" strokeWidth={1.166} />
              )}
              {lots.map((lot, index) => (
                <polygon
                  key={lot.id}
                  points={mapPaths[index]}
                  fill={hoveredLot?.id === lot.id ?
                    (lot.estado === 'disponible' ? 'rgba(16, 185, 129, 0.5)' : lot.estado === 'apartado' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(239, 68, 68, 0.5)')
                    : 'transparent'}
                  // Borde siempre blanco
                  stroke={isMobileView ? 'white' : 'none'}
                  // Grosor dinámico: más grueso si está seleccionado, sutil si no
                  strokeWidth={hoveredLot?.id === lot.id
                    ? (isMobileView ? '2' : '4')
                    : (isMobileView ? '0.8' : '1.5')
                  }
                  // Opacidad del borde para que no sature el mapa cuando no hay selección
                  strokeOpacity={hoveredLot?.id === lot.id ? '1' : '0.6'}
                  className="cursor-pointer transition-all duration-200 ease-in-out"
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
            className={`absolute z-[60] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 transition-all duration-300 ease-out flex flex-col items-center
              ${isMobileView
                ? 'top-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[300px] p-3'
                : 'w-64 p-4 top-1/2 -translate-y-1/2'
              }`}
            style={!isMobileView ? {
              left: tooltipPos.x,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            } : {}}
          >
            {isMobileView && (
              <button
                onClick={() => setHoveredLot(null)}
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-lg"
              >
                ✕
              </button>
            )}

            <div className={`text-slate-800 text-center w-full ${isMobileView ? 'space-y-1' : 'space-y-2'}`}>
              <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1">
                <h3 className={`font-bold ${isMobileView ? 'text-lg' : 'text-xl'}`}>Lote {hoveredLot.id}</h3>
              </div>

              <div className="flex justify-between text-[11px] sm:text-xs">
                <span className="text-slate-500 font-medium">Superficie:</span>
                <span className="font-bold text-slate-700">{hoveredLot.superficieM2} m²</span>
              </div>

              <div className="flex justify-between text-[11px] sm:text-xs">
                <span className="text-slate-500 font-medium">Precio:</span>
                <span className="font-bold text-emerald-600">{formatPrice(hoveredLot.precio)}</span>
              </div>

              <div className={`mt-2 py-1 rounded-lg font-black uppercase tracking-wider ${isMobileView ? 'text-[9px]' : 'text-[10px]'} 
                ${hoveredLot.estado === 'disponible' ? 'bg-emerald-500 text-white' :
                  hoveredLot.estado === 'apartado' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                }`}>
                {hoveredLot.estado}
              </div>
            </div>
          </div>
        )}
      </div>

      {isMobileView && hoveredLot && (
        <div className="fixed inset-0 z-[50]" onClick={() => setHoveredLot(null)} />
      )}
    </div>
  );
};