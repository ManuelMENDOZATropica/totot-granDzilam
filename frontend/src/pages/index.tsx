import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useCotizacion } from '@/hooks/useCotizacion';
import { MapaLotes } from '@/components/mapa/MapaLotes';
import { PanelCotizacion } from '@/components/panel/PanelCotizacion';
import { HeroLanding } from '@/components/home/HeroLanding';
import { ChatbotWidget } from '@/components/chat/ChatbotWidget';
import { type ImagineSize, useImagine } from '@/hooks/useImagine';
import { useAuth } from '@/contexts/AuthContext';
import { InfoPanel } from '@/components/info/InfoPanel';
import { InteractiveMap } from '@/components/InteractiveMap';

// 1. DEFINIMOS LAS 6 VISTAS
const vistas = [
  { nombre: '1', src: '/assets/vistas/1.png' },
  { nombre: '2', src: '/assets/vistas/2.png' },
  { nombre: '3', src: '/assets/vistas/3.png' },
  { nombre: '4', src: '/assets/vistas/4.png' },
  { nombre: '5', src: '/assets/vistas/5.png' },
  { nombre: '6', src: '/assets/vistas/6.png' },
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
    
  const { status, error: imagineError, generate, lastPrompt } = useImagine();
  const { user } = useAuth();
   
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImagineSize>('1024x1024');
  const promptLoaded = useRef(false);
  const [panelMacroAbierto, setPanelMacroAbierto] = useState(false);

  // Inicialización
  const [fondoActual, setFondoActual] = useState('/assets/vistas/1.png');
  const [vistaActiva, setVistaActiva] = useState<number | null>(0); 
  const [fading, setFading] = useState(false);
  const [infoPanelReset, setInfoPanelReset] = useState(0);

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

  const handleImagineSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await generate(prompt, size);
  };

  const handleImagineShortcut = (value: string) => {
    setPrompt(value);
  };

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
  const vistaFija = vistas[0]; // La 1
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
            className={`absolute inset-0 z-0 object-cover transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
          />

          <InfoPanel closeSignal={infoPanelReset} />
            
          {/* ACCESO ADMINISTRATIVO */}
          <div className="absolute top-6 right-6 z-30">
            {mounted && user ? (
              <Link
                href="/crm"
                className="flex flex-col items-start rounded-2xl bg-white/20 px-5 py-3 text-left text-white shadow-lg backdrop-blur transition hover:bg-white/30"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">{user.role}</span>
                <span className="text-base font-semibold">Panel admin</span>
                <span className="text-sm text-white/90">{user.name}</span>
              </Link>
            ) : (
              <Link
                href="/crm"
                className="rounded-full bg-[#385C7A] px-5 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-[#2d4a63]"
              >
                Acceso administrativo
              </Link>
            )}
          </div>

          {/* Logo superior centrado */}
          <div className="absolute top-8 left-1/2 z-20 -translate-x-1/2">
            <Image
              src="/assets/GD.png"
              alt="Logo Gran Dzilam"
              width={160}
              height={160}
              className="object-contain"
              priority
            />
          </div>

          {/* ======================================================== */}
          {/* SELECTOR DE VISTAS (ESCRITORIO - CARRUSEL VERTICAL)     */}
          {/* ======================================================== */}
          <div className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 md:flex">
            
            {/* 1. OPCIÓN FIJA (Vista 1) */}
            <button
              type="button"
              onClick={() => handleCambioVista(0)}
              className="group overflow-hidden rounded-xl transition relative z-20"
            >
              <Image
                src={vistaFija.src}
                alt={vistaFija.nombre}
                width={160}
                height={100}
                className={`h-[100px] w-[160px] object-cover transition-transform duration-300 ${
                  vistaActiva === 0 ? 'scale-[1.05] ring-2 ring-white' : 'group-hover:scale-[1.03] opacity-80 hover:opacity-100'
                }`}
              />
              <div className="absolute bottom-1 right-2 text-[10px] font-bold text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                Vista 1
              </div>
            </button>

            {/* Separador */}

            {/* 2. MÁSCARA DEL CARRUSEL (Muestra 3 opciones) */}
            <div className="relative h-[332px] w-[160px] overflow-hidden rounded-xl">
              
              {/* Contenedor que se mueve (TRACK) */}
              <div 
                className="flex flex-col gap-4 transition-transform duration-500 ease-in-out will-change-transform"
                style={{ transform: `translateY(-${scrollOffset * ITEM_HEIGHT_WITH_GAP}px)` }}
              >
                {vistasDinamicas.map((vista, index) => {
                  // Ajustamos el indice global
                  const globalIndex = index + 1;
                  
                  return (
                    <button
                      key={vista.nombre}
                      type="button"
                      onClick={() => handleCambioVista(globalIndex)}
                      className="group overflow-hidden rounded-xl transition shrink-0"
                    >
                      <Image
                        src={vista.src}
                        alt={vista.nombre}
                        width={160}
                        height={100}
                        className={`h-[100px] w-[160px] object-cover transition-transform duration-300 ${
                          vistaActiva === globalIndex 
                            ? 'scale-[1.05] ring-2 ring-white' 
                            : 'group-hover:scale-[1.03] opacity-80 hover:opacity-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
          {/* ======================================================== */}

          {/* Selector de vistas – móvil */}
          <div className="absolute inset-x-0 bottom-32 z-30 flex justify-center md:hidden">
            <div className="flex gap-2 rounded-2xl bg-white/85 p-2 shadow-lg backdrop-blur overflow-x-auto max-w-[90vw] snap-x">
              {vistas.map((vista, index) => (
                <button
                  key={vista.nombre}
                  type="button"
                  onClick={() => handleCambioVista(index)}
                  className={`group shrink-0 overflow-hidden rounded-xl border-2 transition snap-center ${
                    vistaActiva === index
                      ? 'border-slate-900'
                      : 'border-slate-300 hover:border-slate-900'
                  }`}
                >
                  <Image
                    src={vista.src}
                    alt={vista.nombre}
                    width={96}
                    height={64}
                    className="h-14 w-16 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* PANEL IMAGINAR */}
          <div className="absolute top-[22%] right-[6%] sm:top-[20%] sm:right-[8%] md:top-[18%] md:right-[10%] lg:top-[17%] lg:right-[12%] xl:top-[16%] xl:right-[14%] w-full max-w-md">
            <div className="w-full max-w-md text-center">
              <h1 className="text-[40px] leading-[1.1] font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
                Imagina tu
                <br />
                proyecto ideal
              </h1>

              <form onSubmit={handleImagineSubmit} className="mt-4 space-y-3 max-w-sm ml-auto">
                <input
                  type="text"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Escribe aquí tu proyecto..."
                  className="w-full rounded-full bg-white px-5 py-3 text-sm text-slate-900 shadow-lg outline-none placeholder-[#6b85b5] focus:ring-2 focus:ring-white"
                />

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#385C7A] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#2d4a63]"
                >
                  Imaginar proyecto
                </button>

                <div className="pt-1 text-left">
                  <p className="text-[12px] text-white/85">
                    ¿Sin ideas? Inspírate, cualquier cosa es posible:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Un hotel ecológico', 'Un jungle gym', 'Un desarrollo mixto'].map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => handleImagineShortcut(idea)}
                        className="rounded-full bg-[#385C7A] px-4 py-1.5 text-[12px] text-white transition hover:bg-[#2d4a63]"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.3em] text-white/70 drop-shadow">
                  <span>{status === 'loading' ? 'Generando idea…' : 'Inspiración lista'}</span>
                  {imagineError ? (
                    <span className="text-rose-300 normal-case tracking-normal">{imagineError}</span>
                  ) : null}
                </div>
              </form>
            </div>
          </div>

          {/* PANEL DESLIZABLE UNIFICADO */}
          <div
            className={`
              absolute bottom-0 left-[150px] right-0 pr-6 z-40
              transform transition-transform duration-500 ease-in-out
              ${panelMacroAbierto ? 'translate-y-0' : 'translate-y-[calc(100%-72px)]'}
            `}
          >
            <div className="flex w-full flex-col rounded-t-[20px] bg-[#F3F1EC] border border-[#E2E0DB] font-sans text-[#1C2533]">
   
  {/* --- CABECERA (BOTÓN TOGGLE) --- */}
  <button
    type="button"
    onClick={() => setPanelMacroAbierto(!panelMacroAbierto)}
    className="group relative flex w-full items-center justify-between rounded-t-[20px] bg-white px-6 py-5 text-left outline-none transition-colors hover:bg-[#F8F7F4] lg:px-8"
  >
    <div className="flex items-center gap-5">
      {/* Icono Flecha con animación */}
      <span 
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${
          panelMacroAbierto 
            ? 'bg-[#1C2533] border-[#1C2533] text-white rotate-180' 
            : 'bg-white border-[#E2E0DB] text-[#1C2533] group-hover:border-[#1C2533]'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      
      <span className="font-serif text-2xl font-medium text-[#1C2533]">
        Cotizar macro terreno
      </span>
    </div>
  </button>

  <p className="px-6 pt-3 text-xs text-[#1C2533] lg:px-8">
    Esta herramienta es una representación ilustrativa y no constituye una oferta oficial ni legal.
  </p>

  {/* --- CONTENIDO DESPLEGABLE --- */}
  <div
    className={`h-[85vh] overflow-hidden border-t border-[#E2E0DB] bg-[#F3F1EC] transition-opacity duration-500 ${
      panelMacroAbierto ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
  >
      {/* Grid: Mapa (Flexible) | Panel (Fijo 450px aprox) */}
      <div className="grid h-full lg:grid-cols-[1fr_460px] bg-[#F3F1EC]">
       
        {/* ================= ZONA DEL MAPA (IZQUIERDA) ================= */}
        <div className="relative flex flex-col p-4 lg:p-6 overflow-hidden">

          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#E2E0DB] bg-[#F3F1EC]">
           
            {/* ESTADOS DE CARGA / ERROR */}
            {loading ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-[#64748B]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E2E0DB] border-t-[#1C2533]" />
                <p className="text-sm font-medium tracking-wide">Cargando disponibilidad...</p>
              </div>
            ) : error ? (
              <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
                <p className="text-[#64748B]">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="border-b border-[#1C2533] pb-0.5 text-sm font-medium text-[#1C2533] transition-opacity hover:opacity-70"
                >
                  Reintentar
                </button>
              </div>
            ) : lotes.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F1EC] text-[#1C2533]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L21 21M4.5 4.5L19.5 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                <div>
                  <p className="font-serif text-xl font-medium text-[#1C2533]">No hay lotes disponibles</p>
                  <p className="mt-2 text-sm text-[#64748B]">
                    Por favor, verifica más tarde para nuevas disponibilidades.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
               
                {/* COMPONENTE MAPA */}
                <div className="relative flex-1 bg-[#F3F1EC]/30">
                  <div className="absolute inset-0 overflow-y-auto">
                    {/* Aseguramos que MapaLotes tenga contenedor full */}
                    <MapaLotes 
                      lotes={lotes} 
                      seleccionados={selectedIds} 
                      onToggle={toggleLote} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= ZONA DE COTIZACIÓN (DERECHA) ================= */}
        <div className="h-full border-l border-[#E2E0DB] bg-[#F3F1EC]">
          <PanelCotizacion
            lotesSeleccionados={selectedLots}
            porcentajeEnganche={porcentajeEnganche}
            meses={meses}
            totales={totales}
            configuracion={financeSettings}
            configuracionCargando={loadingFinanceSettings}
            onPorcentajeChange={actualizarPorcentaje}
            onMesesChange={actualizarMeses}
            onLimpiar={limpiarSeleccion}
            onCerrar={() => setPanelMacroAbierto(false)} 
          />
        </div>

      </div>
    </div>
</div>
          </div>

      </section>

      <footer className="bg-[#0F172A] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Gran Dzilam</p>
            <p className="text-xs text-white/70">Tu espacio para visualizar y cotizar con confianza.</p>
            {cookieConsent ? (
              <p className="pt-2 text-[11px] text-white/60">
                Preferencia actual: {cookieConsent === 'all' ? 'todas las cookies' : 'solo las esenciales'}.
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

      {showCookieBanner ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-6 sm:items-center">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#1C2533]">Uso de cookies</h3>
            <p className="mt-2 text-sm text-[#475569]">
              Utilizamos cookies para mejorar tu experiencia y analizar la interacción con nuestro sitio. Puedes aceptar todas
              o quedarte solo con las esenciales para el correcto funcionamiento de la página.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => handleCookieChoice('essential')}
                className="rounded-full border border-[#1C2533] px-4 py-2 text-sm font-medium text-[#1C2533] transition hover:bg-[#1C2533] hover:text-white"
              >
                Aceptar solo esenciales
              </button>
              <button
                type="button"
                onClick={() => handleCookieChoice('all')}
                className="rounded-full bg-[#1C2533] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2d3b50]"
              >
                Aceptar todas
              </button>
            </div>

            <p className="mt-4 text-xs text-[#64748B]">
              Para más detalles consulta nuestro{' '}
              <Link href="/aviso-de-privacidad" className="font-semibold text-[#1C2533] underline-offset-2 hover:underline">
                aviso de privacidad
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}

      <ChatbotWidget />
    </>
  );
}