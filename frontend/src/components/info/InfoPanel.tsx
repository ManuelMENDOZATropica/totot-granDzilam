import Image from 'next/image';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import ContactForm from '@/components/common/ContactForm';
import { createContactSubmission } from '@/lib/contactSubmissions';

// LISTA MANUAL DE TUS IMÁGENES REALES (Renombradas 1-24)
const imagenesRealesList = Array.from({ length: 24 }, (_, i) => `/assets/imagenesReales/${i + 1}.png`);

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
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  // 1. ESTADO PARA EL MODAL DEL MAPA
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
          <div className="space-y-4 text-slate-800 px-4 text-justify sm:px-8 lg:px-[80px]">
            <p>Gran Dzilam es un conjunto de macroterrenos ubicado en Dzilam de Bravo, Yucatán.</p>
            <p>
              Son terrenos de propiedad privada listos para escriturar, ubicados sobre carretera con terreno plano y suelo
              de piedra. Ideales para inversionistas que buscan propiedades de oportunidad.
            </p>
            <p>
              Rodeado de más de 10 proyectos en preventa en la misma vialidad, y más de 30 en sus alrededores, incluyendo
              residenciales y un club de golf a la orilla de la playa.
            </p>
            <p>
              A 2.2 horas de Chichen Itza, XX minutos de la playa y 1.3 horas de Mérida, Gran Dzilam es una inversión
              emergente inteligente para quienes buscan desarrollar un proyecto con crecimiento exponencial en las próximas
              décadas.
            </p>
            <p>
              Su comercialización es a través de Eslabón Inmobiliario, una inmobiliaria con XX años de experiencia en la
              venta de terrenos y desarrollos residenciales en la zona de Yucatán.
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
          <div className="space-y-6 text-slate-800 px-4 text-justify sm:px-8 lg:px-[80px]">
            <div className="space-y-4">
              <p>
                Se encuentra en la <b>costa norte del estado de Yucatán</b>, es una de las pocas zonas vírgenes que quedan
                en Yucatán y una auténtica <b>joya escondida</b> que esta en la mira de inversionistas y desarrolladores.
              </p>
              <p>
                Cuenta con acceso desde <b> vialidad pavimentada</b> con más de 100m lineales de frente. Se encuentra a 5
                minutos de la carretera <b>El Tajo</b>.
              </p>
              <p>
                Si quieres conocer más información sobre la zona en la cual se encuentra Gran Dzilam, y zonas de interés
                cercanas, visita nuestro Blog informativo.
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
  // Mantenemos el contenedor padre
  <div className="w-full max-w-4xl space-y-4 px-4 text-justify text-slate-800 sm:px-6 lg:px-10">

    {/* Contenedor con scroll y estilo unificado */}
    <div className="max-h-[60vh] overflow-x-hidden overflow-y-auto pr-4 overlay-scrollbar">
      
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
          <div className="space-y-4 text-slate-800 px-4 sm:px-8 lg:px-[80px]">
            {/* GRID DE CARACTERÍSTICAS */}
    <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2">
      
      {/* 1. Propiedad Privada */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-[#385C7A]">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M18 20V4" />
             <path d="M6 20V4" />
             <path d="M12 4v2" />
             <path d="M12 10v2" />
             <path d="M12 16v2" />
           </svg>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-lg leading-tight">Acceso pavimentado</h4>
          <p className="text-sm text-slate-600 mt-1">Terrenos a pie de pavimento, ubicados sobre carretera.</p>
        </div>
      </div>

      {/* 3. Dimensiones */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-[#385C7A]">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M21.5 9.5l-7-7L2.5 14.5l7 7 12-12z" />
             <path d="M14.5 2.5l7 7" />
             <path d="M5.5 11.5l7 7" />
             <path d="M9.5 7.5l-4 4" />
           </svg>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-lg leading-tight">Dimensiones</h4>
          <p className="text-sm text-slate-600 mt-1">Desde 8 hasta 17 hectáreas, dividido con mojoneras.</p>
        </div>
      </div>

      {/* 4. Acceso a agua */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-[#385C7A]">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
           </svg>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-lg leading-tight">Acceso a agua</h4>
          <p className="text-sm text-slate-600 mt-1">Se entrega con pozo de agua.</p>
        </div>
      </div>
    </div>
            {/* 2. IMAGEN DEL PLANO (Clickeable) */}
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
            {/* Leyenda debajo */}
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
        content: <ContactForm onSubmit={createContactSubmission} />,
      },
    ],
    [],
  );

  useEffect(() => {
    if (activeId) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        const isButton = target.closest('button');

        if (cardRef.current && !cardRef.current.contains(target as Node) && !isButton) {
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobilePanelOpen(!isMobile);
  }, [isMobile]);

  const activeSection = sections.find((section) => section.id === activeId);
  const shouldShowPanel = !isMobile || isMobilePanelOpen;

  return (
    <>
      {isMobile && (
        <button
          type="button"
          aria-label={isMobilePanelOpen ? 'Cerrar panel' : 'Abrir panel'}
          onClick={() => {
            setIsMobilePanelOpen((open) => {
              if (open) {
                setActiveId(null);
              }
              return !open;
            });
          }}
          className="fixed left-4 top-4 z-40 rounded-full bg-white/90 p-3 shadow-lg transition hover:scale-105 hover:bg-white"
        >
          {isMobilePanelOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
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
      )}

      {shouldShowPanel && (
        <div
          className={`pointer-events-none absolute inset-0 z-30 flex bg-white/80 backdrop-blur-sm ${
            isMobile
              ? 'items-start justify-center px-4 py-4'
              : 'items-center justify-start pl-[50px] pr-4 sm:pr-6 lg:pr-12'
          }`}
        >
          <div className={`pointer-events-auto flex w-full ${isMobile ? 'flex-col' : 'items-center'}`}>
            {/* COLUMNA DE BOTONES */}
            <div
              className={`relative z-20 flex ${
                isMobile ? 'w-full justify-end gap-3 pb-4' : 'flex-col gap-4 py-8'
              }`}
            >
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveId((current) => (current === section.id ? null : section.id))}
                  className={`group relative overflow-hidden rounded-full p-3 shadow-lg backdrop-blur transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                    isMobile ? 'h-11 w-11' : 'h-14 w-14'
                  } ${
                    activeId === section.id ? 'bg-[#1C2E3D]' : 'bg-[#dbd8d3]'
                  }`}
                  aria-label={section.label}
                >
                  <div
                    className={`h-full w-full transition-colors duration-300 ${
                      activeId === section.id ? 'bg-[#dbd8d3]' : 'bg-[#1C2E3D]'
                    }`}
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
              className={`z-10 flex-1 rounded-2xl bg-white/95 shadow-2xl transition-all duration-300 backdrop-blur-md bg-[#D2CEC6] ${
                isMobile
                  ? 'mt-2 w-full min-h-[70vh] max-h-[80vh] translate-x-0 opacity-100 overflow-y-auto p-4 sm:p-6'
                  : '-ml-[88px] min-h-[80vh] min-w-2xl max-w-2xl p-6 pl-[110px]'
              } ${
                activeSection ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-10 opacity-0'
              }`}
            >
              {activeSection ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3
                        className={`${
                          isMobile
                            ? 'ml-0 text-2xl text-left sm:text-3xl'
                            : 'ml-[88px] text-[50px] text-center'
                        } font-semibold text-slate-900`}
                      >
                        {activeSection.title}
                      </h3>
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
              ) : (
                <div className="h-64 w-full opacity-0"></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL A PANTALLA COMPLETA */}
      {isMapModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMapModalOpen(false)}
        >
          <div className="relative h-auto max-h-[90vh] w-auto max-w-[90vw] overflow-hidden rounded-lg shadow-2xl">
            {/* Botón Cerrar Modal */}
            <button 
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation();
                setIsMapModalOpen(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Imagen Grande */}
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