export interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls = ({ page, pageSize, total, onPageChange }: PaginationControlsProps) => {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-200"
      aria-label="Paginación de lotes"
    >
      <p>
        Mostrando {start}-{end} de {total} lotes
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={page <= 1}
          className="rounded-full border border-slate-700 px-4 py-2 font-semibold transition hover:border-sky-400 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="text-xs text-slate-400">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={page >= totalPages}
          className="rounded-full border border-slate-700 px-4 py-2 font-semibold transition hover:border-sky-400 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
};
