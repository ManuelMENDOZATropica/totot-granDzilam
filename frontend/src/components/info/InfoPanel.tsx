import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import ContactForm from '@/components/common/ContactForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { createContactSubmission } from '@/lib/contactSubmissions';

type GalleryCategory = {
  id: string;
  title: string;
  images: string[];
};

const buildImagePath = (fileName: string) =>
  `/assets/imagenesReales/${encodeURIComponent(fileName)}`;

const formatImageTitle = (fileName: string) =>
  fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/_/g, ' ')
    .trim();

const galleryCategories: GalleryCategory[] = [
  {
    id: 'vistas',
    title: 'Vistas',
    images: [
      
      'Perspectictiva desde terreno 1.png',
       'Perspectiva terreno.png',
      'Vista perspectiva Terrenos.png',
      'Vista perspectiva de atras para adelante.png',
      
      'Suelo de piedra bajo la vegetacion.png',

      'Máster Plan con perspectiva.png',
      'Master Plan del predio.png',
      'Perspectiva punto de fuga.png',
      'Perspectiva.png',
      'Vista superior.png',
      

      'Malecón + Puerto.png',
    ],
  },

  {
    id: 'cercanas',
    title: 'Cosas cercanas',
    images: [
      'Cenote Valladolid.jpg',
      'Cenote-Ik-Kil-Galeria-2.jpg.webp',
      'Flamingos close.jpg',
      'Izamal.jpg',
      'Izamal.jpg.webp',
      'Laguna Dzilam.png',
      'Lagunas Dzilam.png',
      'Las coloradas.jpg',
      'Malecon Dzilam.jpeg',
      'Malecon progreso.jpg',
      'Playa _ Laguna Dzilam.png',
      'Playas Dzilam(1).png',
      'Playas Dzilam.png',
      'Puerto Dzilam.png',
      'Puerto prrogreso, segundo mas largo del mundo.jpeg.webp',
      'Valladolid_iglesia.jpg',
    ],
  },
];

interface InfoPanelProps {
  closeSignal?: number;
}

export const InfoPanel = ({ closeSignal }: InfoPanelProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { translations } = useLanguage();
  const sections = translations.infoPanel.sections;

  const renderParagraphs = (paragraphs?: string[]) => (
    <div className="space-y-4 text-slate-800 text-justify w-full">
      {paragraphs?.map((text, index) => (
        <p key={`${text}-${index}`}>{text}</p>
      ))}
    </div>
  );

  const specIcons = [
    <svg
      key="doc"
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
    </svg>,
    <svg
      key="road"
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
    </svg>,
    <svg
      key="dimension"
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
    </svg>,
    <svg
      key="water"
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
    </svg>,
    <svg
      key="growth"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>,
    <svg
      key="connection"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M8 12a4 4 0 1 1 4 4" />
      <path d="M6 12a6 6 0 1 1 6 6" />
    </svg>,
  ];

  const renderSpecs = (specs: { title: string; description: string }[] = []) => (
    <div className="space-y-4 text-slate-800 w-full">
      <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2">
        {specs.map((spec, index) => (
          <div className="flex items-start gap-3" key={spec.title}>
            <div className="shrink-0 text-[#385C7A]">{specIcons[index % specIcons.length]}</div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg leading-tight">{spec.title}</h4>
              <p className="text-sm text-slate-600 mt-1">{spec.description}</p>
            </div>
          </div>
        ))}
      </div>

      

   
    </div>
  );

  const renderGallery = (galleryEmpty?: string) => {
    const hasImages = galleryCategories.some((category) => category.images.length > 0);

    return (
      <div className="space-y-6 text-justify text-slate-800 w-full">
        {galleryCategories.map((category) => (
          <div key={category.id} className="space-y-3">
            <h4 className="text-lg font-semibold text-slate-900">{category.title}</h4>
            <div className="grid grid-cols-1 gap-4">
              {category.images.map((fileName) => {
                const imageTitle = formatImageTitle(fileName);
                return (
                  <figure
                    key={`${category.id}-${fileName}`}
                    className="relative h-52 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02] sm:h-64"
                  >
                    <Image
                      src={buildImagePath(fileName)}
                      alt={`${category.title} - ${imageTitle}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <figcaption className="absolute bottom-0 left-0 right-0 bg-slate-900/60 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                      {imageTitle}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        ))}

        {!hasImages && (
          <p className="py-10 text-center text-sm italic text-slate-500">{galleryEmpty}</p>
        )}
      </div>
    );
  };

  const renderSectionContent = (sectionId: string) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return null;

    if (section.id === 'sobre') {
      return renderParagraphs(section.paragraphs);
    }

    if (section.id === 'ubicacion') {
      return (
        <div className="space-y-6 text-slate-800 text-justify w-full">
          {renderParagraphs(section.paragraphs)}

          <div className="h-[250px] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              title={section.mapTitle ?? section.title}
              src="https://maps.google.com/maps?q=21%C2%B020'49.8%22N+88%C2%B046'01.0%22W&t=m&z=11&ie=UTF8&iwloc=&output=embed"
              className="h-full w-full"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      );
    }

    if (section.id === 'fotos') {
      return renderGallery(section.galleryEmpty);
    }

    if (section.id === 'especificaciones') {
      return renderSpecs(section.specs ?? []);
    }

    if (section.id === 'contacto') {
      return (
        <div className="w-full space-y-4">
          {section.highlight ? <p className="text-sm font-semibold text-[#355F62]">{section.highlight}</p> : null}
          <ContactForm onSubmit={createContactSubmission} />
        </div>
      );
    }

    return null;
  };

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
  const containerPosition = isMobile ? 'fixed' : 'absolute';
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

  const toggleLabel = activeId || isMenuOpen ? translations.panel.actions.close : sections[0]?.label ?? '';

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
      aria-label={toggleLabel}
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
                      {activeSection.highlight ? (
                        <p className="ml-[2px] text-sm font-semibold text-[#355F62]">{activeSection.highlight}</p>
                      ) : null}
                    </div>

                    {!isMobile && (
                      <button
                        type="button"
                        aria-label={translations.panel.actions.close}
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
                    {renderSectionContent(activeSection.id)}
                  </div>
                </div>
              ) : (
                <div className="h-64 w-full opacity-0" />
              )}
            </div>
          </div>
        </div>
      </div>

     
    </>
  );
};

export default InfoPanel;
