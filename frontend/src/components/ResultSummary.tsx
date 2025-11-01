import type { FinanceTotals } from '@/hooks/useLotsSelection';
import { formatCurrency } from '@/lib/format';

export interface ResultSummaryProps {
  visibleCount: number;
  totalCount: number;
  selectedCount: number;
  totals: FinanceTotals;
}

export const ResultSummary = ({ visibleCount, totalCount, selectedCount, totals }: ResultSummaryProps) => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>
          {visibleCount} de {totalCount} lotes visibles · {selectedCount} seleccionados
        </p>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-wide text-slate-400">
          <span>Total: {formatCurrency(totals.totalSeleccionado)}</span>
          <span>Enganche: {formatCurrency(totals.enganche)}</span>
          <span>Mensualidad: {formatCurrency(totals.mensualidad)}</span>
        </div>
      </div>
    </section>
  );
};
