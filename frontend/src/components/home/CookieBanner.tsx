import Link from 'next/link';

interface CookieBannerProps {
  onChoice: (choice: 'all' | 'essential') => void;
}

export const CookieBanner = ({ onChoice }: CookieBannerProps) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-6 sm:items-center">
    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-[#1C2533]">Uso de cookies</h3>
      <p className="mt-2 text-sm text-[#475569]">
        Utilizamos cookies para mejorar tu experiencia y analizar la interacción con nuestro sitio. Puedes aceptar todas o quedarte solo con las esenciales para el correcto funcionamiento de la página.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => onChoice('essential')}
          className="rounded-full border border-[#1C2533] px-4 py-2 text-sm font-medium text-[#1C2533] transition hover:bg-[#1C2533] hover:text-white"
        >
          Aceptar solo esenciales
        </button>
        <button
          type="button"
          onClick={() => onChoice('all')}
          className="rounded-full bg-[#1C2533] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2d3b50]"
        >
          Aceptar todas
        </button>
      </div>

      <p className="mt-4 text-xs text-[#64748B]">
        Para más detalles consulta nuestro{' '}
        <Link href="/aviso-de-privacidad" className="font-semibold text-[#1C2533] underline-offset-2 hover:underline">
          aviso de privacidad
        </Link>
        .
      </p>
    </div>
  </div>
);
