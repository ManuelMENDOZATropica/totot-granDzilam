import Head from 'next/head';
import { Inter } from 'next/font/google';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useCotizacion } from '@/hooks/useCotizacion';
import { MapaLotes } from '@/components/mapa/MapaLotes';
import { PanelCotizacion } from '@/components/panel/PanelCotizacion';
import { ImagineSection } from '@/components/home/ImagineSection';
import { type ImagineSize, useImagine } from '@/hooks/useImagine';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function Home() {
  const {
    lotes,
    lotsMeta,
    loading,
    error,
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
  const { status, result, error, generate, reset, lastPrompt } = useImagine();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImagineSize>('1024x1024');
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
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-12 sm:px-6 lg:flex-row lg:gap-14 lg:px-8">
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
            onPorcentajeChange={actualizarPorcentaje}
            onMesesChange={actualizarMeses}
            onLimpiar={limpiarSeleccion}
          />
        </div>
        <ImagineSection
          prompt={prompt}
          size={size}
          status={status}
          result={result}
          error={error}
          onPromptChange={setPrompt}
          onSizeChange={setSize}
          onSubmit={handleImagineSubmit}
          onShortcut={handleImagineShortcut}
          onRetry={handleImagineRetry}
        />
      </main>
    </>
  );
}
