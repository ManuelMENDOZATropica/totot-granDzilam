import type { Lote, TotalesCotizacion } from '@/hooks/useCotizacion';
import type { FinanceSettingsDTO } from '@/lib/financeSettings';
import { formatearMoneda } from '@/lib/formatoMoneda';

interface PanelCotizacionProps {
  lotesSeleccionados: Lote[];
  porcentajeEnganche: number;
  meses: number;
  totales: TotalesCotizacion;
  configuracion: FinanceSettingsDTO;
  configuracionCargando?: boolean;
  onPorcentajeChange: (valor: number) => void;
  onMesesChange: (valor: number) => void;
  onLimpiar: () => void;
}

export const PanelCotizacion = ({
  lotesSeleccionados,
  porcentajeEnganche,
  meses,
  totales,
  configuracion,
  configuracionCargando = false,
  onPorcentajeChange,
  onMesesChange,
  onLimpiar,
}: PanelCotizacionProps) => {
  const totalMetros = lotesSeleccionados.reduce((acum, lote) => acum + lote.superficieM2, 0);
  const interesActivo = configuracion.interes > 0;

  return (
    <aside className="flex w-full flex-col gap-8 border-t border-slate-200 bg-slate-50 pt-8 lg:max-w-sm lg:border-l lg:border-t-0 lg:border-slate-300 lg:pl-10 lg:pt-0">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Cotización en tiempo real</h2>
        <p className="text-sm text-slate-500">
          Ajusta el enganche y el plazo para conocer la mensualidad estimada de tu selección.
        </p>
      </div>

      <dl className="space-y-4 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <dt className="uppercase tracking-[0.25em] text-slate-400">Lotes seleccionados</dt>
          <dd className="text-base font-semibold text-slate-900">{lotesSeleccionados.length}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="uppercase tracking-[0.25em] text-slate-400">Superficie total</dt>
          <dd className="text-base font-medium text-slate-900">{totalMetros} m²</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="uppercase tracking-[0.25em] text-slate-400">Total</dt>
          <dd className="text-base font-semibold text-slate-900">{formatearMoneda(totales.totalSeleccionado)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="uppercase tracking-[0.25em] text-slate-400">Enganche</dt>
          <dd className="text-base font-medium text-slate-900">{formatearMoneda(totales.enganche)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="uppercase tracking-[0.25em] text-slate-400">Saldo</dt>
          <dd className="text-base font-medium text-slate-900">{formatearMoneda(totales.saldoFinanciar)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="uppercase tracking-[0.25em] text-slate-400">Mensualidad</dt>
          <dd className="text-xl font-semibold text-slate-900">{formatearMoneda(totales.mensualidad)}</dd>
        </div>
        {interesActivo ? (
          <div className="text-xs text-slate-400">
            Incluye interés del {configuracion.interes}% aplicado al saldo a financiar.
          </div>
        ) : null}
      </dl>

      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-2 text-sm text-slate-600">
          <span className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
            Enganche
            <span className="text-base font-semibold text-slate-900">{porcentajeEnganche}%</span>
          </span>
          <input
            type="range"
            min={configuracion.minEnganche}
            max={configuracion.maxEnganche}
            step={1}
            value={porcentajeEnganche}
            onChange={(event) => onPorcentajeChange(Number(event.target.value))}
            className="h-1 w-full appearance-none rounded-full bg-slate-200 accent-slate-900"
            disabled={configuracionCargando}
          />
          <input
            type="number"
            min={configuracion.minEnganche}
            max={configuracion.maxEnganche}
            step={1}
            value={porcentajeEnganche}
            onChange={(event) => onPorcentajeChange(Number(event.target.value))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            disabled={configuracionCargando}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-600">
          <span className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
            Plazo
            <span className="text-base font-semibold text-slate-900">{meses} meses</span>
          </span>
          <input
            type="range"
            min={configuracion.minMeses}
            max={configuracion.maxMeses}
            step={1}
            value={meses}
            onChange={(event) => onMesesChange(Number(event.target.value))}
            className="h-1 w-full appearance-none rounded-full bg-slate-200 accent-slate-900"
            disabled={configuracionCargando}
          />
          <input
            type="number"
            min={configuracion.minMeses}
            max={configuracion.maxMeses}
            step={1}
            value={meses}
            onChange={(event) => onMesesChange(Number(event.target.value))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            disabled={configuracionCargando}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={onLimpiar}
        className="self-start text-sm font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-900"
        disabled={!lotesSeleccionados.length}
      >
        Limpiar selección
      </button>
    </aside>
  );
};
