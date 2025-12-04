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
    <div className="absolute right-4 top-1/2 z-[20] hidden -translate-y-1/2 flex-col gap-4 md:flex">
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
          className={`h-[100px] w-[160px] object-cover transition-transform duration-300 ${
            vistaActiva === 0 ? 'scale-[1.05] ring-2 ring-white' : 'group-hover:scale-[1.03] opacity-80 hover:opacity-100'
          }`}
        />
        <div className="absolute bottom-1 right-2 text-[10px] font-bold text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          Vista 1
        </div>
      </button>

      <div className="relative h-[332px] w-[160px] overflow-hidden rounded-xl">
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
                  className={`h-[100px] w-[160px] object-cover transition-transform duration-300 ${
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
