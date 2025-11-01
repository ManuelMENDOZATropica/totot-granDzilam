import { FormEvent } from 'react';
import { ImaginePreview } from '../imagine/ImaginePreview';
import type { ImagineData, ImagineSize, ImagineStatus } from '../../hooks/useImagine';
import { imagineSizes } from '../../hooks/useImagine';

const shortcutPrompts = ['Casa moderna', 'Glamping ecológico', 'Huerto + terraza', 'Cabaña rústica'];

const labelForSize = (size: ImagineSize) => {
  switch (size) {
    case '1024x1536':
      return 'Vertical 1024×1536';
    case '1536x1024':
      return 'Horizontal 1536×1024';
    case 'auto':
      return 'Auto (recomendado)';
    case '1024x1024':
    default:
      return 'Cuadrado 1024×1024';
  }
};

export interface ImagineSectionProps {
  prompt: string;
  size: ImagineSize;
  status: ImagineStatus;
  result: ImagineData | null;
  imagineError: string | null;
  onPromptChange: (value: string) => void;
  onSizeChange: (value: ImagineSize) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onShortcut: (value: string) => void;
  onRetry: () => void;
}

export const ImagineSection = ({
  prompt,
  size,
  status,
  result,
  imagineError,
  onPromptChange,
  onSizeChange,
  onSubmit,
  onShortcut,
  onRetry,
}: ImagineSectionProps) => {
  return (
    <section className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 text-center sm:text-left">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Gran Dzilam</p>
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Imagina tu lote ideal</h2>
          <p className="text-sm text-slate-500 sm:text-base">
            Cuéntanos qué te gustaría crear y generaremos un concepto visual y un texto inspirador en segundos.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <form className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="imagine-prompt" className="text-sm font-medium text-slate-700">
                Describe lo que imaginas en tu lote
              </label>
              <textarea
                id="imagine-prompt"
                name="imagine-prompt"
                rows={6}
                placeholder="Describe lo que imaginas en tu lote…"
                value={prompt}
                onChange={(event) => onPromptChange(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {shortcutPrompts.map((shortcut) => (
                <button
                  key={shortcut}
                  type="button"
                  onClick={() => onShortcut(shortcut)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
                >
                  {shortcut}
                </button>
              ))}
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-medium text-slate-700">Tamaño de la imagen</legend>
              <div className="flex flex-wrap gap-2">
                {imagineSizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSizeChange(option)}
                    className={`flex-1 min-w-[120px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      size === option
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                    }`}
                    aria-pressed={size === option}
                  >
                    {labelForSize(option)}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Imaginando…' : 'Imaginar mi lote'}
            </button>
          </form>

          <ImaginePreview status={status} result={result} error={imagineError} onRetry={onRetry} />
        </div>
      </div>
    </section>
  );
};
