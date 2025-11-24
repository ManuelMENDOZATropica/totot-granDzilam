import Image from 'next/image';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

interface InfoSection {
  id: string;
  label: string;
  iconPath: string;
  title: string;
  highlight?: string;
  content: ReactNode;
}

interface InfoPanelProps {
  closeSignal?: number;
}

export const InfoPanel = ({ closeSignal }: InfoPanelProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const sections: InfoSection[] = useMemo(
    () => [
      {
        id: 'sobre',
        label: 'Sobre Gran Dzilam',
        iconPath: '/assets/iconos/sobre gran dzilam.png',
        title: 'Gran Dzilam',
        highlight: 'Comunidad planeada frente al mar',
        content: (
          <div className="space-y-4 text-slate-800">
            <p>
              Un master plan con visión de largo plazo que integra lotes urbanizados, amenidades costeras y servicios
              planeados para crear una comunidad rodeada de naturaleza.
            </p>
            <p>
              Gran Dzilam equilibra inversión y estilo de vida: infraestructura lista para construir, espacios para
              disfrutar el mar y un entorno seguro para proyectos residenciales o de hospitalidad.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
              <li>Calles blancas, energía a pie de lote y alumbrado en vialidades principales.</li>
              <li>Club de playa proyectado con alberca, restaurante y acceso directo a la costa.</li>
              <li>Parcelas amplias con orientación pensada para optimizar ventilación y asoleamiento.</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'ubicacion',
        label: 'Ubicación',
        iconPath: '/assets/iconos/Ubicación.png',
        title: 'Dzilam de Bravo, Yucatán',
        highlight: 'Conectividad estratégica',
        content: (
          <div className="space-y-4 text-slate-800">
            <p>
              El desarrollo se ubica a pocos minutos de la costa de Dzilam de Bravo, sobre el corredor que conecta los
              atractivos de la costa yucateca con Mérida y Cancún.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 shadow-inner">
                <p className="font-semibold text-slate-900">Cercanía inmediata</p>
                <p>Playa, zona de manglares y servicios locales a corta distancia.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 shadow-inner">
                <p className="font-semibold text-slate-900">Vialidades principales</p>
                <p>Acceso por carretera costera con conexión rápida hacia Mérida y Tizimín.</p>
              </div>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
              <li>Entorno natural de manglares, reservas y mar abierto.</li>
              <li>Zona de alto crecimiento turístico y logístico en el litoral yucateco.</li>
              <li>Oportunidad para proyectos boutique o residenciales frente al mar.</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'fotos',
        label: 'Fotografías',
        iconPath: '/assets/iconos/fotografias.png',
        title: 'Galería de inspiración',
        highlight: 'Vistas del master plan',
        content: (
          <div className="space-y-4 text-slate-800">
            <p>
              Una selección de renders y vistas aéreas que muestran la escala del macro-terreno, las vialidades y la
              cercanía con el mar.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {['/assets/vistas/1.png', '/assets/vistas/2.png', '/assets/vistas/3.png'].map((src) => (
                <div
                  key={src}
                  className="overflow-hidden rounded-xl border border-white/70 bg-white/60 shadow-lg shadow-slate-900/5"
                >
                  <Image src={src} alt="Vista de Gran Dzilam" width={420} height={280} className="h-28 w-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-700">
              Las imágenes son representativas y pueden variar conforme avance la urbanización y las amenidades del
              proyecto.
            </p>
          </div>
        ),
      },
      {
        id: 'especificaciones',
        label: 'Especificaciones',
        iconPath: '/assets/iconos/especificaciones.png',
        title: 'Características del macro-terreno',
        highlight: 'Listo para proyectar',
        content: (
          <div className="space-y-4 text-slate-800">
            <p>
              Planeación con lotificación modular que facilita la construcción por etapas y la integración de
              amenidades.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
              <li>Parcelas amplias pensadas para desarrollos mixtos o de hospitalidad.</li>
              <li>Calles trazadas para optimizar flujos vehiculares y de servicios.</li>
              <li>Áreas designadas para equipamiento, comercio ligero y zonas verdes.</li>
              <li>Infraestructura proyectada para garantizar iluminación y drenaje pluvial.</li>
            </ul>
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 shadow-inner">
              <p className="font-semibold text-slate-900">Entrega en etapas</p>
              <p>El master plan contempla fases de urbanización que permiten activar zonas conforme avanzan las ventas.</p>
            </div>
          </div>
        ),
      },
      {
        id: 'contacto',
        label: 'Contacto',
        iconPath: '/assets/iconos/contacto.png',
        title: 'Hablemos de tu proyecto',
        highlight: 'Acompañamiento personalizado',
        content: (
          <div className="space-y-4 text-slate-800">
            <p>
              Nuestro equipo comercial puede ayudarte a elegir la mejor sección del desarrollo, preparar un esquema de
              inversión o proyectar la construcción que tienes en mente.
            </p>
            <div className="rounded-xl bg-[#385C7A] p-4 text-white shadow-lg shadow-slate-900/10">
              <p className="text-sm uppercase tracking-[0.2em] text-white/80">Atención al inversionista</p>
              <p className="text-lg font-semibold">Agenda una llamada o recibe la ficha técnica completa.</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <a
                  href="mailto:hola@grandzilam.com"
                  className="rounded-full bg-white px-4 py-2 font-semibold text-[#385C7A] transition hover:bg-slate-100"
                >
                  hola@grandzilam.com
                </a>
                <a
                  href="https://wa.me/529990000000"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/15 px-4 py-2 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25"
                >
                  Mensaje por WhatsApp
                </a>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              También puedes usar el chatbot en la esquina inferior para resolver dudas rápidas sobre precios y
              disponibilidad.
            </p>
          </div>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    if (activeId) {
      const handleClickOutside = (event: MouseEvent) => {
        if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
          setActiveId(null);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [activeId]);

  useEffect(() => {
    setActiveId(null);
  }, [closeSignal]);

  const activeSection = sections.find((section) => section.id === activeId);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-start px-4 pt-28 sm:px-6 lg:px-12">
      <div className="flex flex-col gap-4 pointer-events-auto">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveId((current) => (current === section.id ? null : section.id))}
            // CAMBIOS AQUÍ:
            // 1. h-14 w-14: Define el tamaño del botón.
            // 2. p-0: Elimina el relleno interno.
            // 3. overflow-hidden: Asegura que la imagen no se salga de los bordes redondeados.
            className={`group relative h-14 w-14 overflow-hidden rounded-full shadow-lg backdrop-blur transition-transform hover:scale-110 hover:shadow-xl ${
              activeId === section.id ? 'ring-4 ring-[#385C7A]' : 'ring-1 ring-white/50'
            }`}
            aria-label={section.label}
          >
            {/* 4. La imagen ocupa el 100% de alto y ancho con object-cover */}
            <Image
              src={section.iconPath}
              alt={section.label}
              width={56} // Coincide con w-14 (56px) para optimización
              height={56}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div
        ref={cardRef}
        className={`pointer-events-auto ml-6 max-w-2xl flex-1 rounded-2xl bg-white/95 p-6 shadow-2xl transition-all duration-300 backdrop-blur-md ${
          activeSection ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        {activeSection ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#385C7A]">{activeSection.highlight}</p>
                <h3 className="text-2xl font-semibold text-slate-900">{activeSection.title}</h3>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setActiveId(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {activeSection.content}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InfoPanel;