import clsx from 'clsx';
import type { ImagineData, ImagineStatus } from '@/hooks/useImagine';

interface ImaginePreviewProps {
  status: ImagineStatus;
  result: ImagineData | null;
  error: string | null;
  onRetry: () => void;
}

export const ImaginePreview = ({ status, result, error, onRetry }: ImaginePreviewProps) => {
  const showPlaceholder = status === 'idle' || (!result?.imageUrl && status === 'success');

  return (
    <section
      className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Tu concepto visual</h2>
        <p className="text-sm text-slate-500">
          Generamos un visual de referencia y un texto breve para ayudarte a imaginar tu espacio en Gran Dzilam.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div
          className={clsx(
            'flex h-80 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50',
            status === 'loading' && 'animate-pulse',
          )}
        >
          {status === 'loading' ? (
            <span className="text-sm text-slate-400">Generando inspiración…</span>
          ) : showPlaceholder ? (
            <span className="text-sm text-slate-400 text-center px-6">
              Describe tu idea y aquí aparecerá la imagen conceptual.
            </span>
          ) : result?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.imageUrl}
              alt="Concepto generado para tu lote"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-slate-400">No se recibió una imagen. Intenta de nuevo.</span>
          )}
        </div>

        {status === 'success' && result && (
          <div className="flex flex-col gap-3">
            <p className="text-base text-slate-700">{result.textoInspirador}</p>
            <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              <summary className="cursor-pointer select-none text-sm font-medium text-slate-600 outline-none">
                Ver prompt usado
              </summary>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-500">{result.promptVisual}</p>
            </details>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error ?? 'No se pudo generar la imagen. Inténtalo de nuevo.'}
          </div>
        )}
      </div>

      {(status === 'success' || status === 'error') && (
        <button
          type="button"
          onClick={onRetry}
          className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
        >
          Generar otra
        </button>
      )}
    </section>
  );
};
