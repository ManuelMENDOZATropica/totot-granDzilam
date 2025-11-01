import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { HealthStatus } from '@/components/HealthStatus';
import { GridLotes } from '@/components/GridLotes';
import { FinancePanel } from '@/components/FinancePanel';
import { FiltersBar, type LotsFilters } from '@/components/FiltersBar';
import { PaginationControls } from '@/components/PaginationControls';
import { ResultSummary } from '@/components/ResultSummary';
import { fetchLots, type Lot, type LotsResponse } from '@/lib/api';
import { useLotsSelection } from '@/hooks/useLotsSelection';

const PAGE_SIZE = 12;

const defaultFilters: LotsFilters = {
  estatus: 'todos',
  superficieMin: '',
  superficieMax: '',
  query: '',
};

export default function Home() {
  const [filters, setFilters] = useState<LotsFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [lotsResponse, setLotsResponse] = useState<LotsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLotsData, setSelectedLotsData] = useState<Record<string, Lot>>({});

  const { state, toggleLot, clearSelection, updateMeses, updatePorcentaje, calculateTotals } = useLotsSelection();

  const loadLots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchLots({
        page,
        pageSize: PAGE_SIZE,
        estatus: filters.estatus,
        superficieMin: filters.superficieMin === '' ? undefined : filters.superficieMin,
        superficieMax: filters.superficieMax === '' ? undefined : filters.superficieMax,
        q: filters.query.trim() || undefined,
      });
      setLotsResponse(response);
      setSelectedLotsData((prev) => {
        if (state.selectedIds.length === 0) {
          return {};
        }

        const next = { ...prev };
        response.items.forEach((lot) => {
          if (state.selectedIds.includes(lot.id)) {
            next[lot.id] = lot;
          }
        });
        return next;
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters.estatus, filters.query, filters.superficieMax, filters.superficieMin, page, state.selectedIds]);

  useEffect(() => {
    void loadLots();
  }, [loadLots]);

  useEffect(() => {
    const missingIds = state.selectedIds.filter((id) => !selectedLotsData[id]);
    if (!missingIds.length) {
      return;
    }

    let cancelled = false;

    const fetchMissingLots = async () => {
      const results = await Promise.all(
        missingIds.map(async (id) => {
          try {
            const result = await fetchLots({ page: 1, pageSize: 1, q: id });
            return result.items.find((item) => item.id === id) ?? null;
          } catch (err) {
            console.error('No se pudo cargar el lote', id, err);
            return null;
          }
        }),
      );

      if (cancelled) return;

      setSelectedLotsData((prev) => {
        const next = { ...prev };
        results.forEach((lot) => {
          if (lot) {
            next[lot.id] = lot;
          }
        });
        return next;
      });
    };

    void fetchMissingLots();

    return () => {
      cancelled = true;
    };
  }, [selectedLotsData, state.selectedIds]);

  const totals = useMemo(() => calculateTotals(Object.values(selectedLotsData)), [calculateTotals, selectedLotsData]);

  const handleFiltersChange = (nextFilters: LotsFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const lots = lotsResponse?.items ?? [];
  const totalLots = lotsResponse?.total ?? 0;

  const handleLotToggle = (lotId: string) => {
    const lot = lots.find((item) => item.id === lotId) ?? selectedLotsData[lotId];
    if (!lot) return;

    const alreadySelected = state.selectedIds.includes(lotId);
    toggleLot(lotId);
    setSelectedLotsData((prev) => {
      if (alreadySelected) {
        const { [lotId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [lotId]: lot };
    });
  };

  const handleClearSelection = () => {
    clearSelection();
    setSelectedLotsData({});
  };

  return (
    <>
      <Head>
        <title>Gran Dzilam · Selección de lotes</title>
      </Head>
      <main className="min-h-screen bg-slate-950 pb-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-2 text-slate-100">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-400">Gran Dzilam</p>
            <h1 className="text-3xl font-bold sm:text-4xl">Selecciona tus lotes ideales</h1>
            <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
              Explora la disponibilidad de lotes, aplica filtros y simula el financiamiento en tiempo real. Guarda tu
              selección para retomarla cuando regreses.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:h-fit">
              <FinancePanel
                porcentajeEnganche={state.porcentajeEnganche}
                meses={state.meses}
                totals={totals}
                onPorcentajeChange={updatePorcentaje}
                onMesesChange={updateMeses}
                onClearSelection={handleClearSelection}
                selectedCount={state.selectedIds.length}
              />
              <HealthStatus />
            </aside>

            <section className="flex flex-col gap-4">
              <FiltersBar filters={filters} onFiltersChange={handleFiltersChange} />
              <ResultSummary
                visibleCount={lots.length}
                totalCount={totalLots}
                selectedCount={state.selectedIds.length}
                totals={totals}
              />
              {error && (
                <p className="rounded-lg border border-rose-700 bg-rose-900/40 p-3 text-sm text-rose-200" role="alert">
                  {error}
                </p>
              )}
              <GridLotes
                lots={lots}
                selectedIds={state.selectedIds}
                onToggle={handleLotToggle}
                loading={loading}
                emptyMessage="No hay lotes que cumplan tu búsqueda"
              />
              <PaginationControls
                page={page}
                pageSize={PAGE_SIZE}
                total={totalLots}
                onPageChange={handlePageChange}
              />
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
