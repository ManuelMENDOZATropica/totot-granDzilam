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

const vistas = [
  { nombre: '1', src: '/assets/vistas/1.png' },
  { nombre: '2', src: '/assets/vistas/2.png' },
  { nombre: '3', src: '/assets/vistas/3.png' },
];

export default function Home() {
  const {
    lotes,
    lotsMeta,
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
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImagineSize>('1024x1024');
  const promptLoaded = useRef(false);
  
  // Estado para abrir/cerrar panel
  const [panelMacroAbierto, setPanelMacroAbierto] = useState(false);

  const [fondoActual, setFondoActual] = useState('/assets/vistas/1.png');
  const [vistaActiva, setVistaActiva] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const [infoPanelReset, setInfoPanelReset] = useState(0);

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
          {/* REEMPLAZAR LA ETIQUETA <Image> ACTUAL POR ESTO: */}
<InteractiveMap
  src={fondoActual}
  className={`transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
/>

          <InfoPanel closeSignal={infoPanelReset} />
          
          {/* ACCESO ADMINISTRATIVO */}
          <div className="absolute top-6 right-6 z-30">
            {user ? (
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

          {/* Selector de vistas – escritorio */}
          <div className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 md:flex">
            {vistas.map((vista, index) => (
              <button
                key={vista.nombre}
                type="button"
                onClick={() => handleCambioVista(index)}
                className="group overflow-hidden rounded-xl transition"
              >
                <Image
                  src={vista.src}
                  alt={vista.nombre}
                  width={160}
                  height={100}
                  className={`h-[100px] w-[160px] object-cover transition-transform duration-300 ${
                    vistaActiva === index ? 'scale-[1.05]' : 'group-hover:scale-[1.03]'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Selector de vistas – móvil */}
          <div className="absolute inset-x-0 bottom-32 z-30 flex justify-center md:hidden">
            <div className="flex gap-3 rounded-2xl bg-white/85 p-2 shadow-lg backdrop-blur">
              {vistas.map((vista, index) => (
                <button
                  key={vista.nombre}
                  type="button"
                  onClick={() => handleCambioVista(index)}
                  className={`group overflow-hidden rounded-xl border-2 transition ${
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
                    className="h-16 w-24 object-cover transition-transform duration-300 group-hover:scale-105"
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

          {/* ========================================================= */}
          {/* PANEL DESLIZABLE UNIFICADO (AHORA DENTRO DE LA SECCIÓN)   */}
          {/* ========================================================= */}
          {/* CAMBIOS REALIZADOS:
              1. Movido dentro de <section>
              2. Cambiado 'fixed' por 'absolute'
              3. z-40 para que esté por encima de la imagen de fondo (y del selector de vistas si se solapan)
          */}
          <div
            className={`
              absolute bottom-0 left-[150px] right-0 pr-6 z-40
              transform transition-transform duration-500 ease-out
              ${panelMacroAbierto ? 'translate-y-0' : 'translate-y-[calc(100%-72px)]'}
            `}
          >
            <div className="flex flex-col w-full rounded-t-[20px] bg-white shadow-2xl border border-slate-900/10">
              
              {/* CABECERA QUE FUNCIONA COMO BOTÓN */}
              <button
                type="button"
                onClick={() => setPanelMacroAbierto(!panelMacroAbierto)}
                className="group relative flex w-full items-center justify-between px-8 py-[10px] text-[30px] font-semibold text-slate-900 outline-none hover:bg-slate-50 rounded-t-[20px] transition-colors"
              >
                <div className="flex items-center">
                  <span className={`mr-4 flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/60 bg-white transition-transform duration-500 ${panelMacroAbierto ? 'rotate-180 bg-slate-100' : ''}`}>
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                  </span>
                  <span className="pb-2 block">Cotizar macro terreno</span>
                </div>
              </button>

              {/* CONTENIDO DEL PANEL */}
              <div className="h-[85vh] overflow-y-auto border-t border-slate-200 bg-white pb-20">
                <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.2fr,0.9fr]">
                  
                  {/* ZONA DEL MAPA */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                    {loading ? (
                      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-slate-400">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-gran-sky" />
                        <p className="text-sm">Cargando disponibilidad…</p>
                      </div>
                    ) : error ? (
                      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-8 text-center">
                        <p className="text-sm text-slate-600">{error}</p>
                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          className="text-sm font-medium text-slate-700 underline"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : lotes.length === 0 ? (
                      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
                        <p className="text-base font-medium text-slate-700">No hay lotes disponibles</p>
                        <p className="text-sm text-slate-500">
                          Vuelve más tarde para conocer las nuevas disponibilidades.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>Disponibles</span>
                            <span className="text-base font-semibold text-slate-900">
                              {lotsMeta.total}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow">
                            <span className="h-2.5 w-2.5 rounded-full bg-gran-sky" />
                            Selección activa
                          </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto pr-1">
                          <MapaLotes lotes={lotes} seleccionados={selectedIds} onToggle={toggleLote} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ZONA DE COTIZACIÓN */}
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
                  />
                </div>
              </div>
            </div>
          </div>

        </section>

      </main>

      <ChatbotWidget />
    </>
  );
}