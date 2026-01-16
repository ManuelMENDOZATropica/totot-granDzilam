import Image from 'next/image';

type Vista = { nombre: string; src: string };

interface ViewSelectorDesktopProps {
  vistaActiva: number | null;
  vistas: Vista[];
  onChange: (index: number) => void;
  scrollOffset: number;
  itemHeightWithGap: number;
}

export const ViewSelectorDesktop = ({
  vistaActiva,
  vistas,
  onChange,
  scrollOffset,
  itemHeightWithGap,
}: ViewSelectorDesktopProps) => {
  const vistaFija = vistas[0];
  const vistasDinamicas = vistas.slice(1);

  return (
    <div className="absolute right-[clamp(0.75rem,2vw,1.5rem)] top-1/2 z-[20] hidden -translate-y-1/2 flex-col gap-4 md:flex">
      <button
        type="button"
        onClick={() => onChange(0)}
        className="group overflow-hidden rounded-xl transition relative z-20"
      >
        <Image
          src={vistaFija.src}
          alt={vistaFija.nombre}
          width={160}
          height={100}
          className={`h-[clamp(4.5rem,9vw,6.25rem)] w-[clamp(7.5rem,12vw,10rem)] object-cover transition-transform duration-300 ${
            vistaActiva === 0 ? 'scale-[1.05] ring-2 ring-white' : 'group-hover:scale-[1.03] opacity-80 hover:opacity-100'
          }`}
        />
        <div className="absolute bottom-1 right-2 text-[clamp(0.55rem,1.2vw,0.65rem)] font-bold text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          Vista 1
        </div>
      </button>

      <div className="relative h-[min(50vh,20.75rem)] w-[clamp(7.5rem,12vw,10rem)] overflow-hidden rounded-xl">
        <div
          className="flex flex-col gap-4 transition-transform duration-500 ease-in-out will-change-transform"
          style={{ transform: `translateY(-${scrollOffset * itemHeightWithGap}px)` }}
        >
          {vistasDinamicas.map((vista, index) => {
            const globalIndex = index + 1;

            return (
              <button
                key={vista.nombre}
                type="button"
                onClick={() => onChange(globalIndex)}
                className="group overflow-hidden rounded-xl transition shrink-0"
              >
                <Image
                  src={vista.src}
                  alt={vista.nombre}
                  width={160}
                  height={100}
                  className={`h-[clamp(4.5rem,9vw,6.25rem)] w-[clamp(7.5rem,12vw,10rem)] object-cover transition-transform duration-300 ${
                    vistaActiva === globalIndex
                      ? 'scale-[1.05] ring-2 ring-white'
                      : 'group-hover:scale-[1.03] opacity-80 hover:opacity-100'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
