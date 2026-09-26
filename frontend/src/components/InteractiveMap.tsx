import { useEffect, useRef, useState, MouseEvent, useCallback, CSSProperties } from 'react';
import Image from 'next/image';

interface PublicLot {
  id: string;
  superficieM2: number;
  precio: number;
  estado: 'disponible' | 'vendido' | 'apartado';
  order: number;
}

/**
 * Coordenadas en PIXELES REALES de la imagen de fondo, no en un espacio inventado.
 * Así el SVG es una capa 1:1 sobre la imagen y no se desalinea al cambiar el tamaño
 * de la pantalla ni la proporción del contenedor.
 *
 * Los 13 polígonos van de IZQUIERDA a DERECHA sobre la imagen, en el mismo orden en
 * que la API devuelve los lotes (Lote 13 es el de la izquierda, Lote 1 el de la derecha).
 *
 * Los 12 primeros son cuadriláteros: sus lados salen de intersecar las 14 divisiones
 * verticales con los bordes superior e inferior del terreno. El último lleva vértices
 * intermedios porque su filo derecho no es recto: sigue el borde del monte, que se mete
 * hasta ~50 px hacia dentro en el tramo medio.
 */
const DESKTOP_IMAGE = { width: 7680, height: 4320 };

const LOT_PATHS_DESKTOP = [
  /*  1 */ "689,983 1007,983 972,3622 664,3667",
  /*  2 */ "1007,983 1317,984 1293,3576 972,3622",
  /*  3 */ "1317,984 1639,984 1614,3529 1293,3576",
  /*  4 */ "1639,984 1958,985 1938,3482 1614,3529",
  /*  5 */ "1958,985 2278,986 2259,3435 1938,3482",
  /*  6 */ "2278,986 2595,986 2576,3389 2259,3435",
  /*  7 */ "2595,986 2918,987 2902,3341 2576,3389",
  /*  8 */ "2918,987 3243,987 3225,3294 2902,3341",
  /*  9 */ "3243,987 3560,988 3549,3247 3225,3294",
  /* 10 */ "3560,988 3883,989 3870,3200 3549,3247",
  /* 11 */ "3883,989 4210,989 4194,3153 3870,3200",
  /* 12 */ "4210,989 4533,990 4510,3107 4194,3153",
  /* 13 */ "4533,990 4833,998 4785,1340 4790,1683 4788,2025 4793,2367 4825,2710 4824,3052 4510,3107",
];

/** Color por estado. Mismo criterio en el relleno y en la etiqueta flotante. */
const STATE_FILL = {
  disponible: '16, 185, 129',
  apartado: '234, 179, 8',
  vendido: '239, 68, 68',
} as const;

/** El lote solo se pinta cuando está señalado; en reposo el terreno se ve limpio. */
const FILL_ALPHA_ACTIVE = 0.5;

const LOT_PATHS_MOBILE = [
  /* Lote  1 */ "-80.52,-41.59 -68.00,-41.59 -69.80,38.16 -83.38,39.89",
  /* Lote  2 */ "-68.72,-41.59 -55.48,-41.59 -57.28,36.57 -69.80,38.16",
  /* Lote  3 */ "-55.48,-41.59 -42.96,-41.59 -44.76,34.98 -57.28,36.57",
  /* Lote  4 */ "-42.96,-41.59 -30.44,-41.59 -31.88,33.34 -44.76,34.98",
  /* Lote  5 */ "-30.44,-41.59 -17.92,-41.59 -19.36,31.75 -32.24,33.38",
  /* Lote  6 */ "-17.92,-41.59  -5.40,-41.59  -6.84,30.15 -19.72,31.79",
  /* Lote  7 */  "-5.40,-41.59   7.10,-41.59   5.32,28.61  -6.84,30.15",
  /* Lote  8 */  "7.10,-41.59  19.62,-41.59  18.20,26.97   6.04,28.51",
  /* Lote  9 */ "19.62,-41.59  32.14,-41.59  30.36,25.42  18.56,26.92",
  /* Lote 10 */ "32.14,-41.59  45.02,-41.59  43.58,23.74  31.08,25.33",
  /* Lote 11 */ "45.38,-41.59  57.88,-41.59  55.74,22.19  43.94,23.69",
  /* Lote 12 */ "58.24,-41.59  70.76,-41.59  68.62,20.55  56.46,22.10",
  /* Lote 13 */ "71.12,-41.59  82.20,-41.59  79.36,-23.55  80.42,-3.17  81.50,9.87  81.14,18.96  68.98,20.51",
];

/** Dimensiones reales de mobile1.webp */
const MOBILE_IMAGE = { width: 1024, height: 1536 };
/**
 * Los polígonos están dibujados de izquierda a derecha sobre la imagen, y sobre el
 * terreno el de la izquierda es el Lote 13 y el de la derecha el Lote 1.
 *
 * Antes se emparejaban por la posición del lote en la respuesta de la API. Eso funciona
 * mientras la API devuelva los lotes en ese mismo orden, pero deja de hacerlo en cuanto
 * no: en local, con el orden invertido, el mapa numeraba los lotes al revés. Sacar el
 * número del identificador («Lote 7» → 7) hace que cada polígono sea siempre el que le
 * toca, venga el listado como venga. Si el identificador no trae número, se cae al orden
 * de la lista, que es lo que se hacía siempre.
 */
const indiceDePoligono = (identificador: string, posicion: number, total: number) => {
  const numero = Number.parseInt(identificador.replace(/\D+/g, ''), 10);
  if (!Number.isFinite(numero) || numero < 1 || numero > total) return posicion;
  return total - numero;
};

export const InteractiveMap = ({ src, className, imageClassName }: { src: string; className?: string; imageClassName?: string }) => {
  const [lots, setLots] = useState<PublicLot[]>([]);
  const [hoveredLot, setHoveredLot] = useState<PublicLot | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Estilo calculado dinámicamente para que el SVG cubra la imagen exactamente
  const [overlayStyle, setOverlayStyle] = useState<CSSProperties>(
    { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }
  );

  const isDesktopView = src.includes('1.webp') || src.includes('1.jpg');
  const isMobileView = src.includes('mobile1.webp') || src.includes('mobile1.jpg');
  const isInteractive = isDesktopView || isMobileView;

  const image = isMobileView ? MOBILE_IMAGE : DESKTOP_IMAGE;
  const viewBox = `0 0 ${image.width} ${image.height}`;

  const mapPaths = isMobileView ? LOT_PATHS_MOBILE : LOT_PATHS_DESKTOP;

  // En móvil los paths están en un espacio propio (-80..80) y hay que mapearlos.
  // En desktop ya vienen en píxeles de la imagen, así que no hace falta transform.
  const mapTransform = isMobileView
    ? `translate(512, 1071.4) scale(4.288)`
    : undefined;

  // Grosor de línea en unidades del viewBox, para que se vea igual en ambas vistas.
  const strokeRest = isMobileView ? 0.8 : 6;
  const strokeActive = isMobileView ? 2 : 18;

  /**
   * Calcula el style del SVG móvil para que sea una CAPA IDÉNTICA 1:1 sobre la imagen
   * renderizada (incluyendo sus partes invisibles o recortadas por object-cover).
   * Al hacer esto, las coordenadas del SVG (0 a 1024) son exactamente los pixeles
   * de la imagen, garantizando que NUNCA se desalineen sin importar la pantalla.
   */
  const updateOverlayStyle = useCallback(() => {
    if (!isMobileView || !containerRef.current) return;
    const { offsetWidth: containerW, offsetHeight: containerH } = containerRef.current;
    if (!containerW || !containerH) return;

    // Fórmula estándar de object-cover
    const imageScale = Math.max(
      containerW / image.width,
      containerH / image.height,
    );

    // Dimensiones reales en pixeles que ocupa la imagen escalada
    const renderedImageW = image.width * imageScale;
    const renderedImageH = image.height * imageScale;

    // Si la imagen excede el contenedor, tiene un offset negativo (recorte)
    const imageLeft = (containerW - renderedImageW) / 2;
    const imageTop = (containerH - renderedImageH) / 2;

    setOverlayStyle({
      position: 'absolute',
      top: imageTop,
      left: imageLeft,
      width: renderedImageW,
      height: renderedImageH
    });
  }, [isMobileView, image.width, image.height]);

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
    updateOverlayStyle();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateOverlayStyle);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobileView, updateOverlayStyle]);


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
        {/* En escritorio la imagen se ancla ABAJO: el sobrante de object-cover se recorta
            por arriba (que es solo monte) en vez de repartirse, así el filo inferior de los
            lotes sube y no queda debajo de la píldora de "Cotizar macro terreno".
            Debe ir siempre emparejado con el preserveAspectRatio del SVG de más abajo. */}
        <Image
          src={src}
          alt="Mapa"
          fill
          priority
          className={`object-cover ${isMobileView ? '' : 'object-bottom'} select-none ${imageClassName}`}
          sizes="100vw"
        />

        {isInteractive && (
          <svg
            className="pointer-events-none z-[44]"
            viewBox={viewBox}
            // Móvil: la capa se calcula en JS sobre la imagen renderizada.
            // Desktop: basta con cubrir el contenedor; 'slice' hace el resto.
            style={isMobileView
              ? overlayStyle
              : { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            // 'xMidYMax slice' es el equivalente exacto en SVG de object-fit:cover con
            // object-position:bottom, que es como se pinta la imagen justo arriba. Al
            // recortarse igual que ella, los polígonos NUNCA se desalinean, sea cual sea
            // el tamaño del contenedor. Si cambias uno, cambia el otro.
            preserveAspectRatio={isMobileView ? 'none' : 'xMidYMax slice'}
          >
            <g className="pointer-events-auto" transform={mapTransform}>
              {isMobileView && (
                // Línea inferior de referencia. Desde Lote 1 (-83.38, 39.89) hasta Lote 13 (81.14, 18.96)
                // strokeWidth = 5 / 4.288 para compensar el scaling del transform y verse de 5px.
                <line x1="-83.38" y1="39.89" x2="81.14" y2="18.96" stroke="black" strokeWidth={1.166} />
              )}
              {lots.map((lot, index) => {
                const isActive = hoveredLot?.id === lot.id;
                const rgb = STATE_FILL[lot.estado] ?? STATE_FILL.vendido;
                return (
                  <polygon
                    key={lot.id}
                    points={mapPaths[indiceDePoligono(lot.id, index, mapPaths.length)]}
                    // El color del estado solo aparece en el lote señalado.
                    fill={isActive ? `rgba(${rgb}, ${FILL_ALPHA_ACTIVE})` : 'transparent'}
                    // En desktop el contorno solo aparece bajo el cursor. En móvil no hay
                    // cursor, así que se mantiene visible para separar lotes contiguos.
                    stroke={isActive || isMobileView ? 'white' : 'none'}
                    strokeWidth={isActive ? strokeActive : strokeRest}
                    strokeOpacity={isActive ? 1 : 0.55}
                    className="cursor-pointer transition-all duration-200 ease-in-out"
                    onMouseEnter={(e) => !isMobileView && handleInteraction(e, lot)}
                    onMouseLeave={() => !isMobileView && setHoveredLot(null)}
                    onClick={(e) => isMobileView && handleInteraction(e, lot)}
                  />
                );
              })}
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