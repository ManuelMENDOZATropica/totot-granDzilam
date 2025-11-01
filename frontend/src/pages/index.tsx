import Head from 'next/head';
import { Inter } from 'next/font/google';
import { useCotizacion } from '@/hooks/useCotizacion';
import { MapaLotes } from '@/components/mapa/MapaLotes';
import { PanelCotizacion } from '@/components/panel/PanelCotizacion';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function Home() {
  const {
    lotes,
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
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-slate-400">Cargando disponibilidad…</p>
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
              ) : (
                <MapaLotes lotes={lotes} seleccionados={selectedIds} onToggle={toggleLote} />
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
      </main>
    </>
  );
}
