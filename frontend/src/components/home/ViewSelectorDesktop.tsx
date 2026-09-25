import Image from 'next/image';

export type Vista = { nombre: string; src: string; esDiseno?: boolean };

interface ViewSelectorDesktopProps {
  vistaActiva: number | null;
  /** Diseños generados primero, luego los ejemplos. */
  vistas: Vista[];
  onChange: (index: number) => void;
  /** Vuelve al mapa del cotizador sin descartar los diseños de la lista. */
  onVolverCotizador: () => void;
  cotizadorActivo: boolean;
}

export const ViewSelectorDesktop = ({
  vistaActiva,
  vistas,
  onChange,
  onVolverCotizador,
  cotizadorActivo,
}: ViewSelectorDesktopProps) => (
  <div className="absolute right-[clamp(0.75rem,2vw,1.5rem)] top-1/2 z-[20] hidden max-h-[80vh] -translate-y-1/2 flex-col gap-3 md:flex">
    {/*
      Antes esta posición la ocupaba una miniatura del lote vacío. Al pulsarla volvías al
      cotizador y el diseño generado desaparecía, porque el fondo se reemplazaba y no
      quedaba en ningún sitio. Ahora es un botón explícito y los diseños viven en la lista.
    */}
    <button
      type="button"
      onClick={onVolverCotizador}
      className={`flex w-[clamp(7.5rem,12vw,10rem)] shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[clamp(0.6rem,1.1vw,0.72rem)] font-semibold transition ${
        cotizadorActivo
          ? 'border-white bg-white text-slate-900'
          : 'border-white/60 bg-slate-900/55 text-white backdrop-blur-sm hover:border-white hover:bg-slate-900/75'
      }`}
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 15 7 10l5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Volver al cotizador
    </button>

    <div className="flex flex-col gap-3 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {vistas.map((vista, index) => (
        <button
          key={`${vista.nombre}-${index}`}
          type="button"
          onClick={() => onChange(index)}
          className="group relative shrink-0 overflow-hidden rounded-xl transition"
          title={vista.esDiseno ? vista.nombre : `Ejemplo ${vista.nombre}`}
        >
          <Image
            src={vista.src}
            alt={vista.nombre}
            width={160}
            height={100}
            unoptimized={vista.esDiseno}
            className={`h-[clamp(4.5rem,9vw,6.25rem)] w-[clamp(7.5rem,12vw,10rem)] object-cover transition-transform duration-300 ${
              vistaActiva === index
                ? 'scale-[1.05] ring-2 ring-white'
                : 'opacity-80 group-hover:scale-[1.03] hover:opacity-100'
            }`}
          />
          {vista.esDiseno ? (
            <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-emerald-400 px-2 py-0.5 text-[0.6rem] font-bold text-slate-900">
              {vista.nombre}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  </div>
);
