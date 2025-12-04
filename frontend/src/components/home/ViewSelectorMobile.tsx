import Image from 'next/image';

type Vista = { nombre: string; src: string };

interface ViewSelectorMobileProps {
  vistas: Vista[];
  vistaActiva: number | null;
  onChange: (index: number) => void;
  className?: string;
}

export const ViewSelectorMobile = ({ vistas, vistaActiva, onChange, className = '' }: ViewSelectorMobileProps) => (
  <div className={`relative z-[20] flex w-full justify-center md:hidden ${className}`}>
    <div className="flex gap-2 rounded-2xl bg-white/85 p-2 shadow-lg backdrop-blur overflow-x-auto max-w-[90vw] snap-x">
      {vistas.map((vista, index) => (
        <button
          key={vista.nombre}
          type="button"
          onClick={() => onChange(index)}
          className={`group shrink-0 overflow-hidden rounded-xl border-2 transition snap-center ${
            vistaActiva === index ? 'border-slate-900' : 'border-slate-300 hover:border-slate-900'
          }`}
        >
          <Image
            src={vista.src}
            alt={vista.nombre}
            width={96}
            height={64}
            className="h-14 w-16 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </button>
      ))}
    </div>
  </div>
);
