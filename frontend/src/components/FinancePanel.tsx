import { ChangeEvent } from 'react';
import { formatCurrency } from '@/lib/format';
import type { FinanceTotals } from '@/hooks/useLotsSelection';

export interface FinancePanelProps {
  porcentajeEnganche: number;
  meses: number;
  totals: FinanceTotals;
  onPorcentajeChange: (value: number) => void;
  onMesesChange: (value: number) => void;
  onClearSelection: () => void;
  selectedCount: number;
}

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const FinancePanel = ({
  porcentajeEnganche,
  meses,
  totals,
  onMesesChange,
  onPorcentajeChange,
  onClearSelection,
  selectedCount,
}: FinancePanelProps) => {
  const handlePorcentajeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    onPorcentajeChange(clampNumber(Number.isNaN(value) ? 30 : value, 10, 80));
  };

  const handleMesesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    onMesesChange(clampNumber(Number.isNaN(value) ? 36 : value, 6, 60));
  };

  return (
    <section
      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40"
      aria-labelledby="finance-panel-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="finance-panel-title" className="text-xl font-semibold text-slate-100">
            Simulador de financiamiento
          </h2>
          <p className="text-sm text-slate-400">Ajusta los parámetros para ver los cálculos en vivo.</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-sky-500 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          onClick={onClearSelection}
          disabled={selectedCount === 0}
        >
          Limpiar selección
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Porcentaje de enganche
          <input
            type="range"
            min={10}
            max={80}
            step={1}
            value={porcentajeEnganche}
            onChange={handlePorcentajeChange}
            aria-valuemin={10}
            aria-valuemax={80}
            aria-valuenow={porcentajeEnganche}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-sky-500"
          />
          <input
            type="number"
            min={10}
            max={80}
            step={1}
            value={porcentajeEnganche}
            onChange={handlePorcentajeChange}
            className="w-24 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-right text-base text-slate-100 focus:border-sky-400 focus:outline-none"
            aria-label="Porcentaje de enganche"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Plazo en meses
          <input
            type="range"
            min={6}
            max={60}
            step={1}
            value={meses}
            onChange={handleMesesChange}
            aria-valuemin={6}
            aria-valuemax={60}
            aria-valuenow={meses}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-sky-500"
          />
          <input
            type="number"
            min={6}
            max={60}
            step={1}
            value={meses}
            onChange={handleMesesChange}
            className="w-24 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-right text-base text-slate-100 focus:border-sky-400 focus:outline-none"
            aria-label="Plazo en meses"
          />
        </label>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2" aria-live="polite">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Total seleccionado</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-100">
            {formatCurrency(totals.totalSeleccionado)}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Enganche</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-100">{formatCurrency(totals.enganche)}</dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Saldo a financiar</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-100">
            {formatCurrency(totals.saldoFinanciar)}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Mensualidad estimada</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-100">
            {formatCurrency(totals.mensualidad)}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-slate-500">
        Los cálculos son una estimación sin interés. Ajusta el porcentaje de enganche y el plazo para simular distintos
        escenarios.
      </p>
    </section>
  );
};
