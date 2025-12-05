import Image from 'next/image';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import ContactForm from '@/components/common/ContactForm';
import { createContactSubmission } from '@/lib/contactSubmissions';

// LISTA MANUAL DE TUS IMÁGENES REALES (Renombradas 1-24)
const imagenesRealesList = Array.from(
  { length: 24 },
  (_, i) => `/assets/imagenesReales/${i + 1}.png`,
);

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
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const sections: InfoSection[] = useMemo(
    () => [
      {
        id: 'sobre',
        label: 'Sobre Gran Dzilam',
        iconPath: '/assets/iconos/sobre gran dzilam.png',
        title: 'Sobre Gran Dzilam',
        highlight: 'Macroterrenos de inversión',
        content: (
          <div className="space-y-4 text-slate-800 text-justify w-full">
            <p>Gran Dzilam es un conjunto de macroterrenos ubicado en Dzilam de Bravo, Yucatán.</p>
            <p>
              Son terrenos de propiedad privada listos para escriturar, ubicados sobre carretera con
              terreno plano y suelo de piedra. Ideales para inversionistas que buscan propiedades de
              oportunidad.
            </p>
            <p>
              Rodeado de más de 10 proyectos en preventa en la misma vialidad, y más de 30 en sus
              alrededores, incluyendo residenciales y un club de golf a la orilla de la playa.
            </p>
            <p>
              A 2.2 horas de Chichen Itza, XX minutos de la playa y 1.3 horas de Mérida, Gran Dzilam
              es una inversión emergente inteligente para quienes buscan desarrollar un proyecto con
              crecimiento exponencial en las próximas décadas.
            </p>
            <p>
              Su comercialización es a través de Eslabón Inmobiliario, una inmobiliaria con XX años de
              experiencia en la venta de terrenos y desarrollos residenciales en la zona de Yucatán.
            </p>
            <p>Si quieres conocer más información sobre Gran Dzilam consulta nuestro Blog informativo.</p>
          </div>
        ),
      },
      {
        id: 'ubicacion',
        label: 'Ubicación',
        iconPath: '/assets/iconos/Ubicación.png',
        title: 'Ubicación',
        highlight: 'Entorno de alta plusvalía',
        content: (
          <div className="space-y-6 text-slate-800 text-justify w-full">
            <div className="space-y-4">
              <p>
                Se encuentra en la <b>costa norte del estado de Yucatán</b>, es una de las pocas zonas
                vírgenes que quedan en Yucatán y una auténtica <b>joya escondida</b> que esta en la mira
                de inversionistas y desarrolladores.
              </p>
              <p>
                Cuenta con acceso desde <b>vialidad pavimentada</b> con más de 100m lineales de frente.
                Se encuentra a 5 minutos de la carretera <b>El Tajo</b>.
              </p>
              <p>
                Si quieres conocer más información sobre la zona en la cual se encuentra Gran Dzilam, y
                zonas de interés cercanas, visita nuestro Blog informativo.
              </p>
            </div>

            {/* Google Maps Embed */}
            <div className="h-[250px] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                title="Ubicación Gran Dzilam"
                src="https://maps.google.com/maps?q=21%C2%B020'49.8%22N+88%C2%B046'01.0%22W&t=m&z=11&ie=UTF8&iwloc=&output=embed"
                className="h-full w-full"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        ),
      },
      {
        id: 'fotos',
        label: 'Fotografías',
        iconPath: '/assets/iconos/fotografias.png',
        title: 'Fotografías',
        highlight: 'Vistas del master plan',
        content: (
          <div className="space-y-4 text-justify text-slate-800 w-full">
            <div className="grid grid-cols-1 gap-4">
              {imagenesRealesList.map((src, index) => (
                <div
                  key={src + index}
                  className="relative h-48 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02] sm:h-60"
                >
                  <Image
                    src={src}
                    alt={`Vista real Gran Dzilam ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>

            {imagenesRealesList.length === 0 && (
              <p className="py-10 text-center text-sm italic text-slate-500">
                Próximamente imágenes de avance de obra.
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'especificaciones',
        label: 'Especificaciones',
        iconPath: '/assets/iconos/especificaciones.png',
        title: 'Especificaciones',
        highlight: 'Listo para desarrollar',
        content: (
          <div className="space-y-4 text-slate-800 w-full">
            <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2">
              {/* 1. Propiedad Privada */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 text-[#385C7A]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">Propiedad privada</h4>
                  <p className="text-sm text-slate-600 mt-1">Terrenos seguros, listos para escriturar.</p>
                </div>
              </div>

              {/* 2. Acceso Pavimentado */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 text-[#385C7A]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 20V4" />
                    <path d="M6 20V4" />
                    <path d="M12 4v2" />
                    <path d="M12 10v2" />
                    <path d="M12 16v2" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">Acceso pavimentado</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Terrenos a pie de pavimento, ubicados sobre carretera.
                  </p>
                </div>
              </div>

              {/* 3. Dimensiones */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 text-[#385C7A]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.5 9.5l-7-7L2.5 14.5l7 7 12-12z" />
                    <path d="M14.5 2.5l7 7" />
                    <path d="M5.5 11.5l7 7" />
                    <path d="M9.5 7.5l-4 4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">Dimensiones</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Desde 8 hasta 17 hectáreas, dividido con mojoneras.
                  </p>
                </div>
              </div>

              {/* 4. Acceso a agua */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 text-[#385C7A]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">Acceso a agua</h4>
                  <p className="text-sm text-slate-600 mt-1">Se entrega con pozo de agua.</p>
                </div>
              </div>
            </div>

            {/* IMAGEN DEL PLANO (Clickeable) */}
            <div
              className="w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => setIsMapModalOpen(true)}
              role="button"
              tabIndex={0}
            >
              <Image
                src="/assets/plano.png"
                alt="Plano Master Plan"
                width={800}
                height={600}
                className="h-auto w-full object-cover"
              />
            </div>

            <p
              className="text-sm text-slate-500 text-center cursor-pointer hover:text-slate-700 hover:underline"
              onClick={() => setIsMapModalOpen(true)}
            >
              Click para ver en grande
            </p>
          </div>
        ),
      },
      {
        id: 'contacto',
        label: 'Contacto',
        iconPath: '/assets/iconos/contacto.png',
        title: 'Contacto',
        highlight: 'Comercialización Exclusiva',
        content: (
          <div className="w-full">
            <ContactForm onSubmit={createContactSubmission} />
          </div>
        ),
      },
    ],
    [],
  );

  // Cerrar al hacer click fuera de la tarjeta
  useEffect(() => {
    if (activeId) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        const isButton = target.closest('button');

        if (cardRef.current && !cardRef.current.contains(target as Node) && !isButton) {
          setActiveId(null);
          setIsMenuOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [activeId]);

  // Cerrar por señal externa
  useEffect(() => {
    setActiveId(null);
    setIsMenuOpen(false);
  }, [closeSignal]);

  // Detectar móvil / desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeSection = sections.find((section) => section.id === activeId);
  const isExpanded = Boolean(activeSection);
  const containerPosition = 'absolute';
  const horizontalPadding = isMobile
    ? 'items-start justify-start px-4 py-4'
    : `items-start pt-[35vh] xl:items-center xl:pt-0 justify-start pl-[50px] ${
        isExpanded ? 'pr-4 sm:pr-6 lg:pr-12' : 'pr-2'
      }`;
  const contentWidth = isMobile
    ? isExpanded
      ? 'w-full'
      : 'w-fit'
    : isExpanded
      ? 'w-full max-w-4xl'
      : 'w-fit';

  // Botón principal (Hamburguesa / X)
  const handleMainButtonClick = () => {
    if (isMobile) {
      if (activeId) {
        setActiveId(null);
        setIsMenuOpen(false);
      } else {
        setIsMenuOpen((prev) => !prev);
      }
    } else {
      setActiveId(null);
    }
  };

  const MobileMenuButton = (
    <button
      type="button"
      aria-label={activeId || isMenuOpen ? 'Cerrar' : 'Abrir menú'}
      onClick={handleMainButtonClick}
      className="rounded-full bg-white/80 p-2 shadow-lg transition hover:scale-105 hover:bg-white pointer-events-auto z-[42]"
    >
      {activeId || isMenuOpen ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="h-6 w-6 text-slate-800"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6 text-slate-800"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      )}
    </button>
  );

  return (
    <>
      {/* CONTENEDOR GLOBAL ENCIMA DE TODO */}
        <div className={`${containerPosition} inset-0 z-[55] pointer-events-none`}>
          <div className={`absolute inset-0 flex pointer-events-none ${horizontalPadding}`}>
            <div
              className={`flex pointer-events-auto ${
                isMobile
                  ? activeId
                    ? 'flex-col min-h-full min-w-full'
                    : 'flex-col'
                  : 'items-center'
              } ${contentWidth}`}
            >
            {/* Botón hamburguesa en móvil */}
            {isMobile && (
              <div className="pb-2 z-[44] pointer-events-auto">
                {MobileMenuButton}
              </div>
            )}

            {/* MENÚ DE BOTONES */}
            <div
              className={
                isMobile
                  ? [
                      'absolute top-[10px] left-[80px]',
                      'flex flex-row gap-3 p-2 ',
                      'transition-all duration-500 z-[42]',
                      isMenuOpen
                        ? 'translate-x-0 opacity-100 pointer-events-auto'
                        : 'translate-x-[-150%] opacity-0 pointer-events-none',
                    ].join(' ')
                  : 'flex flex-col gap-4 py-8 z-[42] pointer-events-auto'
              }
            >
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    setActiveId(section.id);
                  }}
                  className={[
                    'group relative overflow-hidden rounded-full p-3 shadow-lg backdrop-blur',
                    'transition-all duration-300 hover:scale-110 hover:shadow-xl',
                    isMobile ? 'h-11 w-11' : 'h-14 w-14',
                    activeId === section.id ? 'bg-[#1C2E3D]' : 'bg-[#dbd8d3]',
                  ].join(' ')}
                  aria-label={section.label}
                >
                  <div
                    className={[
                      'h-full w-full transition-colors duration-300',
                      activeId === section.id ? 'bg-[#dbd8d3]' : 'bg-[#1C2E3D]',
                    ].join(' ')}
                    style={{
                      maskImage: `url("${section.iconPath}")`,
                      WebkitMaskImage: `url("${section.iconPath}")`,
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                    }}
                  />
                </button>
              ))}
            </div>

            {/* TARJETA DE CONTENIDO */}
            <div
              ref={cardRef}
              className={[
                'rounded-2xl bg-[#D2CEC6] bg-white/95 shadow-2xl backdrop-blur-md',
                'transition-all duration-500 z-[41]',
                isMobile
                  ? 'absolute top-0 left-0 w-full h-full pt-[70px] p-4 sm:p-6 flex flex-col'
                  : '-ml-[88px] h-[70vh] w-full max-w-3xl p-6 pl-[110px] overflow-hidden flex flex-col',
                activeSection
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-4 pointer-events-none',
              ].join(' ')}
            >
              {activeSection ? (
                <div className="flex flex-col h-full min-h-0 space-y-3">
                  <div className="flex items-start justify-between gap-3 shrink-0">
                    <div>
                      <h3
                        className={[
                          isMobile
                            ? 'ml-0 text-2xl text-left sm:text-3xl'
                            : 'ml-[88px] text-[50px] text-center',
                          'font-semibold text-slate-900',
                        ].join(' ')}
                      >
                        {activeSection.title}
                      </h3>
                    </div>

                    {!isMobile && (
                      <button
                        type="button"
                        aria-label="Cerrar"
                        onClick={() => setActiveId(null)}
                        className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 z-[42]"
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
                    )}
                  </div>

                  {/* Contenido con scroll interno */}
                  <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto pt-4 px-4 sm:px-8 lg:px-[80px] pb-8 overlay-scrollbar">
                    {activeSection.content}
                  </div>
                </div>
              ) : (
                <div className="h-64 w-full opacity-0" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DEL PLANO */}
      {isMapModalOpen && (
        <div
          className="fixed inset-0 z-[45] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMapModalOpen(false)}
        >
          <div className="relative h-auto max-h-[90vh] w-auto max-w-[90vw] overflow-hidden rounded-lg shadow-2xl">
            <button
              className="absolute right-4 top-4 z-[46] rounded-full bg-black/50 p-2 text-white hover:bg-black/70 backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation();
                setIsMapModalOpen(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <Image
              src="/assets/plano.png"
              alt="Plano Master Plan Grande"
              width={1600}
              height={1200}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default InfoPanel;
