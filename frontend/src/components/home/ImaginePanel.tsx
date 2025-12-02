import type { FormEvent } from 'react';

interface ImaginePanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  onShortcut: (value: string) => void;
  status: string;
  imagineError: string | null;
}

export const ImaginePanel = ({
  prompt,
  onPromptChange,
  onSubmit,
  onShortcut,
  status,
  imagineError,
}: ImaginePanelProps) => (
  <div className="absolute top-[22%] right-[6%] sm:top-[20%] sm:right-[8%] md:top-[18%] md:right-[10%] lg:top-[17%] lg:right-[12%] xl:top-[16%] xl:right-[14%] w-full max-w-md">
    <div className="w-full max-w-md text-center">
      <h1 className="text-[40px] leading-[1.1] font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
        Imagina tu
        <br />
        proyecto ideal
      </h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-3 max-w-sm ml-auto">
        <input
          type="text"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="Escribe aquí tu proyecto..."
          className="w-full rounded-full bg-white px-5 py-3 text-sm text-slate-900 shadow-lg outline-none placeholder-[#6b85b5] focus:ring-2 focus:ring-white"
        />

        <button
          type="submit"
          className="w-full rounded-full bg-[#385C7A] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#2d4a63]"
        >
          Imaginar proyecto
        </button>

        <div className="pt-1 text-left">
          <p className="text-[12px] text-white/85">¿Sin ideas? Inspírate, cualquier cosa es posible:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['Un hotel ecológico', 'Un jungle gym', 'Un desarrollo mixto'].map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => onShortcut(idea)}
                className="rounded-full bg-[#385C7A] px-4 py-1.5 text-[12px] text-white transition hover:bg-[#2d4a63]"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.3em] text-white/70 drop-shadow">
          <span>{status === 'loading' ? 'Generando idea…' : 'Inspiración lista'}</span>
          {imagineError ? <span className="text-rose-300 normal-case tracking-normal">{imagineError}</span> : null}
        </div>
      </form>
    </div>
  </div>
);
