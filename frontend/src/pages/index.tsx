import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useCotizacion } from '@/hooks/useCotizacion';
import { MapaLotes } from '@/components/mapa/MapaLotes';
import { PanelCotizacion } from '@/components/panel/PanelCotizacion';
import { ImagineSection } from '@/components/home/ImagineSection';
import { HeroLanding } from '@/components/home/HeroLanding';
import { ChatbotWidget } from '@/components/chat/ChatbotWidget';
import { type ImagineSize, useImagine } from '@/hooks/useImagine';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
  const promptLoaded = useRef(false);
  const [panelMacroAbierto, setPanelMacroAbierto] = useState(false);

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

  return (
    <>
      <Head>
        <title>Gran Dzilam · Cotizador de lotes</title>
        <meta
          name="description"
          content="Selecciona tus lotes y simula la mensualidad en segundos con el cotizador interactivo de Gran Dzilam."
        />
      </Head>

      <main className={`${inter.variable} min-h-screen bg-white text-slate-900 scroll-smooth`}>
        <HeroLanding />

        {/* ============================ */}
        {/* SECCIÓN MACRO TERRENO        */}
        {/* ============================ */}
        <section id="macro-terreno" className="relative isolate min-h-screen overflow-hidden bg-slate-900 text-white">
          <Image
            src="/assets/Group 9.png"
            alt="Plano aéreo de Gran Dzilam"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" aria-hidden="true" />

          <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-between px-4 py-10 sm:px-6 lg:px-8">

            {/* === PANEL DE IMAGINAR === */}
            <div className="max-w-xl rounded-3xl bg-white/80 p-6 text-slate-900 shadow-2xl backdrop-blur">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Gran Dzilam</p>
              <div className="mt-3 flex items-center gap-3">
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Imagina tu proyecto ideal</h1>
                <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 sm:inline">
                  Macro terreno
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Inspírate con una propuesta de usos o introduce tu propia idea. Luego cotiza el macro terreno con los valores
                actualizados del cotizador.
              </p>

              <form onSubmit={handleImagineSubmit} className="mt-6 space-y-3">
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Describe tu proyecto</span>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Escribe aquí tu proyecto"
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
                  {['Imaginar proyecto', 'Un hotel ecológico', 'Un jungle gym'].map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => handleImagineShortcut(idea)}
                      className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {idea}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>{status === 'loading' ? 'Generando idea…' : 'Inspiración lista'}</span>
                  {imagineError ? <span className="text-rose-500">{imagineError}</span> : null}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Imaginar proyecto
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImagineShortcut('Más inspiración')}
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Más ideas
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* ================================ */}
          {/* BOTÓN INFERIOR TIPO BARRA (NUEVO) */}
          {/* ================================ */}
{/* BOTÓN INFERIOR TIPO BARRA */}
<div className="pointer-events-none absolute bottom-6 left-[150px] right-0 pr-6 lg:bottom-5">
  <button
    type="button"
    onClick={() => setPanelMacroAbierto(true)}
    className="pointer-events-auto flex w-full items-center rounded-[20px] border border-slate-900/25 bg-white/95 px-8 py-[10px] text-[30px] font-semibold text-slate-900 shadow-2xl backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white"
  >
    <span className="mr-4 flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/60 bg-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.7}
        stroke="currentColor"
        className="h-8 w-8"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </span>
    <span>Cotizar macro terreno</span>
  </button>
</div>




        </section>

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

      {/* PANEL DESLIZABLE MACRO TERRENO */}
      <div
  className={`fixed bottom-0 left-[150px] right-0 pr-6 z-50 transform transition-transform duration-500 ease-out ${
    panelMacroAbierto ? 'translate-y-0' : 'translate-y-[calc(100%+2rem)]'
  }`}
  role="dialog"
  aria-modal="true"
  aria-label="Cotizador macro terreno"
>
  <div className="w-full rounded-t-[20px] border border-slate-200 bg-white shadow-2xl">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cotizar</p>
              <h2 className="text-lg font-semibold text-slate-900">Macro terreno</h2>
            </div>
            <button
              type="button"
              onClick={() => setPanelMacroAbierto(false)}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-900"
            >
              Cerrar
            </button>
          </div>

          <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.2fr,0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
              {loading ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-slate-400">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-gran-sky" />
                  <p className="text-sm">Cargando disponibilidad…</p>
                </div>
              ) : error ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm text-slate-600">{error}</p>
                  <button type="button" onClick={() => window.location.reload()} className="text-sm font-medium text-slate-700 underline">
                    Reintentar
                  </button>
                </div>
              ) : lotes.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
                  <p className="text-base font-medium text-slate-700">No hay lotes disponibles</p>
                  <p className="text-sm text-slate-500">Vuelve más tarde para conocer las nuevas disponibilidades.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Disponibles</span>
                      <span className="text-base font-semibold text-slate-900">{lotsMeta.total}</span>
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
    </>
  );
}
