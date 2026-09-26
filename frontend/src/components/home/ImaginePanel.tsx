import { useState, type FormEvent } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConstruyendoIndicador } from './ConstruyendoIndicador';

interface ImaginePanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  onShortcut: (value: string, index: number) => void;
  status: string;
  imagineError: string | null;
  /** Ajusta la imagen ya generada en vez de crear otra desde cero. */
  onRefine?: (instruccion: string) => Promise<void> | void;
  /** Solo hay refinamiento si la generación previa devolvió un id de interacción. */
  puedeRefinar?: boolean;
  /** Lote sobre el que se está dibujando, para mostrarlo mientras se construye. */
  numeroLote?: number;
}

export const ImaginePanel = ({
  prompt,
  onPromptChange,
  onSubmit,
  onShortcut,
  status,
  imagineError,
  onRefine,
  puedeRefinar = false,
  numeroLote,
}: ImaginePanelProps) => {
  const { translations } = useLanguage();
  const copy = translations.imagine;
  const [ajuste, setAjuste] = useState('');

  const enviarAjuste = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const texto = ajuste.trim();
    if (!texto || !onRefine) return;
    await onRefine(texto);
    setAjuste('');
  };

  return (
    <div className="absolute top-[15%] right-[0%] sm:top-[20%] sm:right-[8%] md:top-[18%] md:right-[10%] lg:top-[17%] lg:right-[12%] xl:top-[16%] xl:right-[14%] w-full max-w-md z-[30]">
      <div className="relative isolate w-full max-w-md text-center">
        {/*
          El texto es blanco y detrás puede haber cualquier cosa: selva a pleno sol, el
          pasto claro del predio o un diseño generado de color impredecible. Una sombra
          sola no basta contra un fondo claro, así que va un velo oscuro que se desvanece
          antes de llegar a los bordes: sube el contraste sin dibujar una caja.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(3,12,22,0.66)_0%,rgba(3,12,22,0.5)_45%,rgba(3,12,22,0)_73%)]"
        />

        <h1 className="text-[40px] leading-[1.1] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85),0_6px_22px_rgba(0,0,0,0.6)]">
          {copy.titleLine1}
          <br />
          {copy.titleLine2}
        </h1>

        <form onSubmit={onSubmit} className="mt-4 space-y-3 max-w-sm ml-auto">
          <input
            type="text"
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder={copy.placeholder}
            className="w-full rounded-full bg-white px-5 py-3 text-sm text-slate-900 shadow-lg outline-none placeholder-[#6b85b5] focus:ring-2 focus:ring-white"
          />

          <button
            type="submit"
            className="w-full rounded-full bg-[#385C7A] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#2d4a63]"
          >
            {copy.action}
          </button>

          <div className="pt-1 text-left">
            <p className="text-[12px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
              {copy.inspirationLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {copy.inspirationItems.map((idea, index) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => onShortcut(idea, index)}
                  className="rounded-full bg-[#385C7A] px-4 py-1.5 text-[12px] text-white transition hover:bg-[#2d4a63]"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.3em] text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
            <span className={status === 'loading' ? 'animate-pulse' : ''}>
              {status === 'loading' ? copy.status.loading : copy.status.ready}
            </span>
            {imagineError ? <span className="text-rose-300 normal-case tracking-normal">{imagineError}</span> : null}
          </div>
        </form>

        <ConstruyendoIndicador activo={status === 'loading'} numeroLote={numeroLote} />

        {/* Ajuste sobre la imagen ya generada: encadena con Gemini en vez de empezar
            de cero, así lo construido se mantiene y solo cambia lo que se pide. */}
        {puedeRefinar && onRefine && status !== 'loading' ? (
          <form onSubmit={enviarAjuste} className="mt-3 max-w-sm ml-auto">
            <label htmlFor="imagine-ajuste" className="sr-only">
              Ajustar la imagen generada
            </label>
            <div className="flex gap-2">
              <input
                id="imagine-ajuste"
                type="text"
                value={ajuste}
                onChange={(event) => setAjuste(event.target.value)}
                placeholder="Ajusta: ponle más palmeras…"
                className="w-full rounded-full bg-white/90 px-4 py-2 text-sm text-slate-900 shadow outline-none placeholder-slate-500 focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                disabled={status === 'loading' || !ajuste.trim()}
                className="shrink-0 rounded-full bg-slate-900/85 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-40"
              >
                Ajustar
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
};
