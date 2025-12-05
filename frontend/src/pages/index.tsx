
import Head from 'next/head';

import Image from 'next/image';

import Link from 'next/link';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { useCotizacion } from '@/hooks/useCotizacion';

import { HeroLanding } from '@/components/home/HeroLanding';

import { ChatbotWidget } from '@/components/chat/ChatbotWidget';

import { useImagine } from '@/hooks/useImagine';

import { useAuth } from '@/contexts/AuthContext';

import { InfoPanel } from '@/components/info/InfoPanel';

import { InteractiveMap } from '@/components/InteractiveMap';

import { AdminAccessLink } from '@/components/home/AdminAccessLink';

import { ViewSelectorDesktop } from '@/components/home/ViewSelectorDesktop';

import { ViewSelectorMobile } from '@/components/home/ViewSelectorMobile';

import { ImaginePanel } from '@/components/home/ImaginePanel';

import { MacroCotizadorPanel } from '@/components/home/MacroCotizadorPanel';

import { CookieBanner } from '@/components/home/CookieBanner';

type Destination = {

  name: string;

  state: string;

  lat: number;

  lng: number;

  description: string;

};

const CENTER_COORDINATE = { lat: 21.347166, lng: -88.766944 };

type DirectionalMarker = Destination & {

  top: number;

  left: number;

  rotation: number;

};

const DESTINATIONS: Destination[] = [

  {

    name: 'Mérida',

    state: 'Yucatán',

    lat: 20.9753,

    lng: -89.6167,

    description: 'Capital de Yucatán, reconocida por su arquitectura colonial y vida cultural vibrante.',

  },

  {

    name: 'Progreso',

    state: 'Yucatán',

    lat: 21.2833,

    lng: -89.6667,

    description: 'Puerto turístico famoso por su malecón y playas tranquilas frente al golfo.',

  },

  {

    name: 'Dzilam de Bravo',

    state: 'Yucatán',

    lat: 21.4,

    lng: -88.92,

    description: 'Comunidad costera cercana a reservas naturales y experiencias ecoturísticas.',

  },

  {

    name: 'Telchac Puerto',

    state: 'Yucatán',

    lat: 21.3239,

    lng: -89.2631,

    description: 'Playa yucateca de ambiente relajado y gastronomía marina.',

  },

  {

    name: 'Xcambo (Zona Arqueológica)',

    state: 'Yucatán',

    lat: 21.3167,

    lng: -89.3333,

    description: 'Antiguo puerto salinero maya con templos y vistas hacia los manglares.',

  },

  {

    name: 'Celestún',

    state: 'Yucatán',

    lat: 20.85,

    lng: -90.4,

    description: 'Reserva de la biósfera conocida por sus flamencos rosados y manglares.',

  },

  {

    name: 'Ticul',

    state: 'Yucatán',

    lat: 20.4008,

    lng: -89.5339,

    description: 'Ciudad artesanal famosa por su alfarería y producción de calzado.',

  },

  {

    name: 'Izamal',

    state: 'Yucatán',

    lat: 20.9306,

    lng: -89.0189,

    description: 'El “Pueblo Amarillo”, mezcla de historia colonial y vestigios mayas.',

  },

  {

    name: 'Cenote Yokdzonot',

    state: 'Yucatán',

    lat: 20.5367,

    lng: -88.4411,

    description: 'Cenote comunitario rodeado de naturaleza y actividades de aventura.',

  },

  {

    name: 'Yaxcabá',

    state: 'Yucatán',

    lat: 20.6667,

    lng: -88.75,

    description: 'Municipio yucateco cercano a cenotes y zonas arqueológicas menos exploradas.',

  },

  {

    name: 'Chichén Itzá (Zona Arqueológica)',

    state: 'Yucatán',

    lat: 20.6843,

    lng: -88.5678,

    description: 'Una de las nuevas maravillas del mundo, hogar de la Pirámide de Kukulkán.',

  },

  {

    name: 'Valladolid',

    state: 'Yucatán',

    lat: 20.6861,

    lng: -88.2017,

    description: 'Pueblo Mágico con arquitectura colonial y acceso a cenotes cristalinos.',

  },

  {

    name: 'Tizimín',

    state: 'Yucatán',

    lat: 21.15,

    lng: -88.15,

    description: 'Centro ganadero de Yucatán con festividades tradicionales muy concurridas.',

  },

  {

    name: 'El Cuyo',

    state: 'Yucatán',

    lat: 21.5147,

    lng: -87.6628,

    description: 'Pueblo pesquero de ambiente relajado y playas de arena blanca.',

  },

  {

    name: 'San Felipe',

    state: 'Yucatán',

    lat: 21.5667,

    lng: -88.25,

    description: 'Localidad costera con casas de colores brillantes y paseos por ría.',

  },

  {

    name: 'Río Lagartos',

    state: 'Yucatán',

    lat: 21.5833,

    lng: -88.1833,

    description: 'Paraje natural para observar flamencos y recorrer manglares en lancha.',

  },

  {

    name: 'Las Coloradas',

    state: 'Yucatán',

    lat: 21.6083,

    lng: -87.9897,

    description: 'Lagunas rosadas icónicas gracias a su alta concentración de sal.',

  },

  {

    name: 'Holbox (Isla)',

    state: 'Quintana Roo',

    lat: 21.52,

    lng: -87.38,

    description: 'Isla de arenas blancas y avistamiento de tiburón ballena en temporada.',

  },

  {

    name: 'Cancún',

    state: 'Quintana Roo',

    lat: 21.1743,

    lng: -86.8466,

    description: 'Destino caribeño con playas turquesa, hotelería de lujo y vida nocturna.',

  },

  {

    name: 'Isla Mujeres',

    state: 'Quintana Roo',

    lat: 21.2333,

    lng: -86.7333,

    description: 'Isla cercana a Cancún famosa por sus arrecifes y el parque Garrafón.',

  },

  {

    name: 'Playa del Carmen',

    state: 'Quintana Roo',

    lat: 20.62,

    lng: -87.07,

    description: 'Ciudad costera con la famosa Quinta Avenida y acceso a ferris hacia Cozumel.',

  },

  {

    name: 'Cenote Azul',

    state: 'Quintana Roo',

    lat: 18.6472,

    lng: -88.4133,

    description: 'Cenote cercano a Bacalar con aguas profundas y saltos desde plataformas.',

  },

  {

    name: 'Tulum',

    state: 'Quintana Roo',

    lat: 20.2118,

    lng: -87.4646,

    description: 'Playas caribeñas combinadas con ruinas mayas frente al mar.',

  },

  {

    name: 'Gran Cenote',

    state: 'Quintana Roo',

    lat: 20.2639,

    lng: -87.4,

    description: 'Famoso cenote de aguas cristalinas y cavernas ideales para snorkel.',

  },

];



// 1. DEFINIMOS LAS 6 VISTAS

const vistasDesktop = [

  { nombre: '1', src: '/assets/vistas/1.png' },

  { nombre: '2', src: '/assets/vistas/2.png' },

  { nombre: '3', src: '/assets/vistas/3.png' },

  { nombre: '4', src: '/assets/vistas/4.png' },

  { nombre: '5', src: '/assets/vistas/5.png' },

  { nombre: '6', src: '/assets/vistas/6.png' },

];

const vistasMobile = [

  { nombre: '1', src: '/assets/vistas/mobile1.png' },

  { nombre: '2', src: '/assets/vistas/mobile2.png' },

  { nombre: '3', src: '/assets/vistas/mobile3.png' },

  { nombre: '4', src: '/assets/vistas/mobile4.png' },

  { nombre: '5', src: '/assets/vistas/mobile5.png' },

  { nombre: '6', src: '/assets/vistas/mobile6.png' },

];



export default function Home() {

  const [cookieConsent, setCookieConsent] = useState<'all' | 'essential' | null>(null);

  const [showCookieBanner, setShowCookieBanner] = useState(false);



  const {

    lotes,

    loading,

    error,

    financeSettings,

    loadingFinanceSettings,

    selectedIds,

    selectedLots,

    porcentajeEnganche,

    meses,

    totales,

    toggleLote,

    limpiarSeleccion,

    actualizarPorcentaje,

    actualizarMeses,

  } = useCotizacion();



  const { status, error: imagineError, generate, lastPrompt, result } = useImagine();

  const { user } = useAuth();



  const [mounted, setMounted] = useState(false);

  const [prompt, setPrompt] = useState('');

  const promptLoaded = useRef(false);

  const [panelMacroAbierto, setPanelMacroAbierto] = useState(false);

  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);



  // Inicialización

  const [fondoActual, setFondoActual] = useState(vistasDesktop[0].src);

  const [vistaActiva, setVistaActiva] = useState<number | null>(0);

  const [fading, setFading] = useState(false);

  const [infoPanelReset, setInfoPanelReset] = useState(0);

  const [vistas, setVistas] = useState(vistasDesktop);



  useEffect(() => {

    setMounted(true);

  }, []);



  useEffect(() => {

    const storedConsent = localStorage.getItem('cookieConsent');

    if (storedConsent === 'all' || storedConsent === 'essential') {

      setCookieConsent(storedConsent);

      return;

    }

    setShowCookieBanner(true);

  }, []);



  useEffect(() => {

    if (!promptLoaded.current && lastPrompt) {

      setPrompt(lastPrompt);

      promptLoaded.current = true;

    }

  }, [lastPrompt]);



  useEffect(() => {

    if (typeof window === 'undefined') return;



    const mediaQuery = window.matchMedia('(max-width: 768px)');



    const updateVistas = (matches: boolean) => {

      const vistasObjetivo = matches ? vistasMobile : vistasDesktop;



      setVistas(vistasObjetivo);



      setVistaActiva((prev) => {

        if (prev !== null && prev < vistasObjetivo.length) return prev;

        return 0;

      });



      setFondoActual((actual) => {

        const sigueDisponible = vistasObjetivo.some((vista) => vista.src === actual);

        if (sigueDisponible) return actual;

        return vistasObjetivo[0]?.src ?? actual;

      });

    };



    updateVistas(mediaQuery.matches);



    const handleChange = (event: MediaQueryListEvent) => updateVistas(event.matches);



    mediaQuery.addEventListener('change', handleChange);



    return () => mediaQuery.removeEventListener('change', handleChange);

  }, []);



  useEffect(() => {

    if (status !== 'success' || !result?.imageUrl) return;



    const imageUrl = result.imageUrl;

    setFading(true);

    const timer = setTimeout(() => {

      setFondoActual(imageUrl);

      setFading(false);

    }, 200);



    return () => clearTimeout(timer);

  }, [result, status]);



  const handleImagineSubmit = async (event: FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    await generate(prompt, '1024x1024');

  };



  const handleImagineShortcut = (value: string) => {

    setPrompt(value);

  };

  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const calculateBearing = (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {

    const lat1 = toRadians(from.lat);

    const lat2 = toRadians(to.lat);

    const deltaLng = toRadians(to.lng - from.lng);

    const y = Math.sin(deltaLng) * Math.cos(lat2);

    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    const bearing = Math.atan2(y, x) * (180 / Math.PI);

    return (bearing + 360) % 360;

  };

  const directionalMarkers = useMemo<DirectionalMarker[]>(() => {

    const radius = 46; // porcentaje del contenedor para llevar los iconos al contorno

    return DESTINATIONS.map((destination) => {

      const bearing = calculateBearing(CENTER_COORDINATE, destination);

      const angleRad = toRadians(bearing - 90);

      const left = 50 + radius * Math.cos(angleRad);

      const top = 50 + radius * Math.sin(angleRad);

      return {

        ...destination,

        rotation: bearing + 180,

        left,

        top,

      };

    });

  }, []);



  const handleCambioVista = (index: number) => {

    const vista = vistas[index];

    if (!vista) return;

    setInfoPanelReset((value) => value + 1);



    if (vista.src === fondoActual) {

      setVistaActiva(index);

      return;

    }



    setVistaActiva(index);

    setFading(true);

    setTimeout(() => {

      setFondoActual(vista.src);

      setFading(false);

    }, 200);

  };



  const handleCookieChoice = (choice: 'all' | 'essential') => {

    setCookieConsent(choice);

    localStorage.setItem('cookieConsent', choice);

    setShowCookieBanner(false);

  };



  const handleOpenCookieBanner = () => {

    setShowCookieBanner(true);

  };



  // --- LÓGICA DEL CARRUSEL VERTICAL (DESKTOP) ---

  const vistasDinamicas = vistas.slice(1); // Las 2, 3, 4, 5, 6...



  // Altura de cada item + gap (100px + 16px)

  const ITEM_HEIGHT_WITH_GAP = 116;



  // Usamos el operador ?? para asegurar que activeIndex sea un número

  const activeIndex = vistaActiva ?? 0;



  // Muestra 3 items a la vez en la ventana deslizante

  const VISIBLE_ITEMS = 3;



  // Límite máximo de scroll (para que no se pase al vacío al final)

  const maxScrollIndex = Math.max(0, vistasDinamicas.length - VISIBLE_ITEMS);



  // Usamos -2 para centrar la selección y mostrar contexto

  const idealOffset = Math.max(0, activeIndex - 2);



  // Aseguramos no pasarnos del tope

  const scrollOffset = Math.min(idealOffset, maxScrollIndex);



  return (

    <>

      <Head>

        <title>Gran Dzilam · Cotizador de lotes</title>

        <meta

          name="description"

          content="Selecciona tus lotes y simula la mensualidad en segundos con el cotizador interactivo de Gran Dzilam."

        />

      </Head>



      <main className="min-h-screen bg-white text-slate-900 scroll-smooth">

        <HeroLanding />



        {/* ============================ */}

        {/* SECCIÓN MACRO TERRENO        */}

        {/* ============================ */}

        <section

          id="macro-terreno"

          className="relative isolate min-h-screen overflow-hidden text-white"

        >

          <InteractiveMap

            src={fondoActual}

            className={`absolute inset-0 z-1 object-cover transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}

          />



          <InfoPanel closeSignal={infoPanelReset} />



          <div className="pointer-events-none absolute inset-0 z-30">

            {directionalMarkers.map((marker) => (

              <button

                key={`${marker.name}-${marker.state}`}

                type="button"

                onClick={() => setSelectedDestination(marker)}

                className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"

                style={{ left: `${marker.left}%`, top: `${marker.top}%` }}

                aria-label={`${marker.name}, ${marker.state}`}

              >

                <Image

                  src="/assets/direction-pointer.svg"

                  alt={`${marker.name} dirección`}

                  width={48}

                  height={48}

                  className="drop-shadow-lg transition-transform duration-150 hover:scale-105"

                  style={{ transform: `translate(-50%, -50%) rotate(${marker.rotation}deg)` }}

                />

              </button>

            ))}

          </div>



          {selectedDestination ? (

            <div className="absolute bottom-6 left-1/2 z-30 w-[92vw] max-w-3xl -translate-x-1/2 rounded-2xl bg-white/90 p-5 text-slate-900 shadow-2xl backdrop-blur">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Referencia cercana</p>

                  <h3 className="text-xl font-bold text-slate-900">

                    {selectedDestination.name} <span className="text-slate-500">· {selectedDestination.state}</span>

                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{selectedDestination.description}</p>

                </div>

                <button

                  type="button"

                  onClick={() => setSelectedDestination(null)}

                  className="h-9 rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"

                >

                  Cerrar

                </button>

              </div>

            </div>

          ) : null}



          <AdminAccessLink mounted={mounted} user={user} />



          <div className="absolute top-8 left-1/2 z-20 -translate-x-1/2">

            <Image

              src="/assets/GD.png"

              alt="Logo Gran Dzilam"

              width={140}

              height={140}

              className="h-20 w-20 object-contain sm:h-28 sm:w-28"

              priority

            />

          </div>



          <ViewSelectorDesktop

            vistas={vistas}

            vistaActiva={vistaActiva}

            onChange={handleCambioVista}

            scrollOffset={scrollOffset}

            itemHeightWithGap={ITEM_HEIGHT_WITH_GAP}

          />



          <ViewSelectorMobile

            vistas={vistas}

            vistaActiva={vistaActiva}

            onChange={handleCambioVista}

            className="mt-[60vh] px-4 pb-12"

          />



          <ImaginePanel

            prompt={prompt}

            onPromptChange={setPrompt}

            onSubmit={handleImagineSubmit}

            onShortcut={handleImagineShortcut}

            status={status}

            imagineError={imagineError}

          />



          <MacroCotizadorPanel

            panelMacroAbierto={panelMacroAbierto}

            onToggle={() => setPanelMacroAbierto((value) => !value)}

            loading={loading}

            error={error}

            lotes={lotes}

            selectedIds={selectedIds}

            toggleLote={toggleLote}

            selectedLots={selectedLots}

            porcentajeEnganche={porcentajeEnganche}

            meses={meses}

            totales={totales}

            configuracion={financeSettings}

            configuracionCargando={loadingFinanceSettings}

            onPorcentajeChange={actualizarPorcentaje}

            onMesesChange={actualizarMeses}

            onLimpiar={limpiarSeleccion}

          />

        </section>



        <footer className="bg-[#0F172A] text-white">

          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold">Gran Dzilam</p>

              <p className="text-xs text-white/70">

                Tu espacio para visualizar y cotizar con confianza.

              </p>

              {cookieConsent ? (

                <p className="pt-2 text-[11px] text-white/60">

                  Preferencia actual:{' '}

                  {cookieConsent === 'all' ? 'todas las cookies' : 'solo las esenciales'}.

                </p>

              ) : null}

            </div>



            <div className="flex flex-wrap items-center gap-3 text-sm">

              <Link

                href="/aviso-de-privacidad"

                className="rounded-full border border-white/30 px-4 py-2 transition hover:border-white hover:bg-white hover:text-[#0F172A]"

              >

                Aviso de privacidad

              </Link>

              <button

                type="button"

                onClick={handleOpenCookieBanner}

                className="rounded-full bg-white px-4 py-2 text-[#0F172A] transition hover:scale-[1.01]"

              >

                Preferencias de cookies

              </button>

            </div>

          </div>

        </footer>

      </main>



      {showCookieBanner ? <CookieBanner onChoice={handleCookieChoice} /> : null}



      <ChatbotWidget />

    </>

  );

}



