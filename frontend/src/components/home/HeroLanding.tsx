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
          className="h-auto w-4/5 max-w-5xl sm:w-3/4 md:w-2/3"
        />
      </div>

      <Link
        href="#cotizador"
        aria-label="Ir al cotizador"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-white/80 p-3 shadow-md backdrop-blur transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gran-sky"
      >
        <Image
          src="/assets/keyboard_double_arrow_down.png"
          alt="Desplazarse al cotizador"
          width={32}
          height={32}
          className="h-8 w-8"
        />
      </Link>
    </section>
  );
};

export default HeroLanding;
