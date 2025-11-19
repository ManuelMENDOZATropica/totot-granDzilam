import Head from 'next/head';
import { Inter } from 'next/font/google';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useCotizacion } from '@/hooks/useCotizacion';
import { MapaLotes } from '@/components/mapa/MapaLotes';
import { PanelCotizacion } from '@/components/panel/PanelCotizacion';
import { ImagineSection } from '@/components/home/ImagineSection';
import { HeroLanding } from '@/components/home/HeroLanding';
import { ChatbotWidget } from '@/components/chat/ChatbotWidget';
import { type ImagineSize, useImagine } from '@/hooks/useImagine';
import { HeaderBar } from '@/components/layout/HeaderBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const vistas = [
  {
    id: 'mar',
    titulo: 'Vista al mar esmeralda',
    descripcion:
      'Disfruta de la brisa marina y de la luz natural que envuelve cada lote con un tono cálido y relajante.',
    fondo:
      'linear-gradient(120deg, rgba(0,163,173,0.35), rgba(0,163,173,0.1)), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80)',
  },
  {
    id: 'selva',
    titulo: 'Senderos entre la selva',
    descripcion:
      'Camina entre áreas arboladas y caminos iluminados que conectan cada etapa del proyecto de manera orgánica.',
    fondo:
      'linear-gradient(140deg, rgba(0,118,94,0.45), rgba(10,87,71,0.15)), url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80)',
  },
  {
    id: 'club',
    titulo: 'Club de playa y amenidades',
    descripcion:
      'Vistas al área social con alberca, terrazas y espacios perfectos para convivir con familia y amigos.',
    fondo:
      'linear-gradient(135deg, rgba(255,184,0,0.45), rgba(255,248,235,0.2)), url(https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80)',
  },
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
  const { status, result, error: imagineError, generate, reset, lastPrompt } = useImagine();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImagineSize>('1024x1024');
  const [vistaActiva, setVistaActiva] = useState(vistas[0]);
  const promptLoaded = useRef(false);

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

  const handleImagineRetry = () => {
    reset();
  };

  const handleSeleccionVista = (vistaId: string) => {
    const vista = vistas.find((vistaActual) => vistaActual.id === vistaId);
    if (vista) {
      setVistaActiva(vista);
    }
  };

  const scrollToCotizador = () => {
    const contenedor = document.getElementById('cotizador');
    contenedor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      <main className={`${inter.variable} min-h-screen bg-white text-slate-900`}>
        <HeroLanding />

        <div id="cotizador" className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-10 transition-[background-image] duration-500"
            style={{
              backgroundImage: vistaActiva.fondo,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white" aria-hidden="true" />

          <div className="relative mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-lg backdrop-blur">
              <div
                className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row"
                style={{
                  backgroundImage: vistaActiva.fondo,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-slate-900/40" aria-hidden="true" />
                <div className="relative flex flex-1 flex-col gap-4 text-white">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">Nuevas vistas</p>
                  <h2 className="text-2xl font-semibold sm:text-3xl">{vistaActiva.titulo}</h2>
                  <p className="max-w-2xl text-sm text-white/85 sm:text-base">{vistaActiva.descripcion}</p>
                </div>

                <div className="relative hidden w-48 shrink-0 flex-col gap-3 lg:flex">
                  {vistas.map((vista) => {
                    const activa = vista.id === vistaActiva.id;
                    return (
                      <button
                        key={vista.id}
                        type="button"
                        onClick={() => handleSeleccionVista(vista.id)}
                        aria-label={`Seleccionar ${vista.titulo}`}
                        aria-pressed={activa}
                        className={`group flex items-center gap-3 rounded-2xl border border-white/30 bg-white/15 p-2 text-left transition hover:border-white/70 hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                          activa ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        <span
                          className="h-16 w-16 rounded-xl bg-white/10"
                          style={{
                            backgroundImage: vista.fondo,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                          aria-hidden="true"
                        />
                        <span className="flex-1 text-sm font-semibold leading-tight text-white">
                          {vista.titulo}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative -mx-2 flex gap-3 overflow-x-auto px-2 lg:hidden">
                  {vistas.map((vista) => {
                    const activa = vista.id === vistaActiva.id;
                    return (
                      <button
                        key={vista.id}
                        type="button"
                        onClick={() => handleSeleccionVista(vista.id)}
                        aria-label={`Seleccionar ${vista.titulo}`}
                        aria-pressed={activa}
                        className={`relative h-24 min-w-[7.5rem] overflow-hidden rounded-2xl border border-white/40 bg-white/10 text-left transition hover:border-white/80 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                          activa ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        <span
                          className="absolute inset-0"
                          style={{
                            backgroundImage: vista.fondo,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                          aria-hidden="true"
                        />
                        <span className="absolute inset-0 bg-slate-900/40" aria-hidden="true" />
                        <span className="relative block p-3 text-xs font-semibold text-white">{vista.titulo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-white/30 bg-white/75 px-6 py-4 text-center backdrop-blur sm:px-8">
                <button
                  type="button"
                  onClick={scrollToCotizador}
                  className="inline-flex items-center justify-center rounded-full bg-gran-sky px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200 active:translate-y-0"
                >
                  Cotizar macro terreno
                </button>
              </div>
            </section>

            <HeaderBar />

            <div className="flex flex-col gap-12 lg:flex-row lg:gap-14">
              <section className="flex flex-1 flex-col gap-10">
                <header className="flex flex-col gap-3">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Gran Dzilam</p>
                  <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Selecciona tus lotes y cotiza en segundos</h1>
                  <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
                    Visualiza la disponibilidad en el plano interactivo, elige tus lotes favoritos y ajusta los parámetros de
                    financiamiento para conocer el plan que mejor se adapta a ti.
                  </p>
                </header>

                <div className="flex flex-1 flex-col justify-between gap-12 pb-12">
                  {loading ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-slate-400">
                      <div
                        className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-gran-sky"
                        aria-hidden="true"
                      />
                      <p className="text-sm">Cargando disponibilidad…</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 p-8 text-center">
                      <p className="text-sm text-slate-500">{error}</p>
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : lotes.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 p-10 text-center">
                      <p className="text-base font-medium text-slate-600">No hay lotes disponibles</p>
                      <p className="text-sm text-slate-400">Vuelve más tarde para conocer las nuevas disponibilidades.</p>
                    </div>
                  ) : (
                    <div className="flex flex-1 flex-col gap-6">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-400">
                        <span>Disponibles</span>
                        <span className="text-base font-semibold text-slate-900">{lotsMeta.total}</span>
                      </div>
                      <MapaLotes lotes={lotes} seleccionados={selectedIds} onToggle={toggleLote} />
                    </div>
                  )}
                </div>
              </section>

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

        <ImagineSection
          prompt={prompt}
          size={size}
          status={status}
          result={result}
          imagineError={imagineError}
          onPromptChange={setPrompt}
          onSizeChange={setSize}
          onSubmit={handleImagineSubmit}
          onShortcut={handleImagineShortcut}
          onRetry={handleImagineRetry}
        />
      </main>
      <ChatbotWidget />
    </>
  );
}
