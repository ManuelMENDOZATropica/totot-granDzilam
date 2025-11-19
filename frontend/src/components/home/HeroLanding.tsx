import Image from 'next/image';
import Link from 'next/link';

export const HeroLanding = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      <Image
  src="/assets/Group 9.png"
  alt="Fondo Gran Dzilam"
  fill
  priority
  quality={100}
  sizes="100vw"
  className="object-cover"
/>


      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/assets/Group 6.png"
          alt="Logotipo Gran Dzilam"
          width={1200}
          height={700}
          priority
          className="h-auto w-auto max-w-[300px]"
        />
      </div>

      {/* Flecha inline SVG con animación al presionar */}
      <Link
        href="#macro-terreno"
        aria-label="Ir al cotizador"
        className="
          group
          absolute bottom-10 left-1/2 -translate-x-1/2 
          rounded-full bg-white/80 p-3 shadow-md backdrop-blur 
          transition hover:scale-105 
          active:scale-95 active:bg-white/60
          focus-visible:outline focus-visible:outline-2 
          focus-visible:outline-offset-4 focus-visible:outline-gran-sky
        "
      >
        <span
          className="
            block h-8 w-8 text-gray-700 
            animate-bounce
            transition-all duration-700 ease-out
            group-active:translate-y-2 
            group-active:opacity-60 
            group-active:scale-90
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-full w-full"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9l7.5 7.5L19.5 9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5L12 12 19.5 4.5" />
          </svg>
        </span>
      </Link>
    </section>
  );
};

export default HeroLanding;
