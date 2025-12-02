import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
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
    
  const { status, error: imagineError, generate, lastPrompt, result } = useImagine();
  const { user } = useAuth();
   
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState('');
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

  useEffect(() => {
    if (status !== 'success' || !result?.imageUrl) return;

    setFading(true);
    const timer = setTimeout(() => {
      setFondoActual(result.imageUrl);
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
            className={`absolute inset-0 z-0 object-cover transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
          />

          <InfoPanel closeSignal={infoPanelReset} />

          <AdminAccessLink mounted={mounted} user={user} />

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

          <ViewSelectorDesktop
            vistas={vistas}
            vistaActiva={vistaActiva}
            onChange={handleCambioVista}
            scrollOffset={scrollOffset}
            itemHeightWithGap={ITEM_HEIGHT_WITH_GAP}
          />

          <ViewSelectorMobile vistas={vistas} vistaActiva={vistaActiva} onChange={handleCambioVista} />

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

      {showCookieBanner ? <CookieBanner onChoice={handleCookieChoice} /> : null}

      <ChatbotWidget />
    </>
  );
}