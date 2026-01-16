import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useCotizacion } from '@/hooks/useCotizacion';
import { HeroLanding } from '@/components/home/HeroLanding';
import { ChatbotWidget } from '@/components/chat/ChatbotWidget';
import { LAST_IMAGE_KEY, getImagineImageSrc, useImagine } from '@/hooks/useImagine';
import { useAuth } from '@/contexts/AuthContext';
import { InfoPanel } from '@/components/info/InfoPanel';
import { InteractiveMap } from '@/components/InteractiveMap';
import { AdminAccessLink } from '@/components/home/AdminAccessLink';
import { ViewSelectorDesktop } from '@/components/home/ViewSelectorDesktop';
import { ImaginePanel } from '@/components/home/ImaginePanel';
import { MacroCotizadorPanel } from '@/components/home/MacroCotizadorPanel';
import { CookieBanner } from '@/components/home/CookieBanner';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/common/LanguageSelector';
import { ContactForm } from '@/components/common/ContactForm';
import {
  createContactSubmission,
  type CreateContactSubmissionPayload,
} from '@/lib/contactSubmissions';

const BrochureViewer = dynamic(
  () => import('@/components/home/BrochureViewer').then((mod) => mod.BrochureViewer),
  {
    ssr: false,
  },
);

const INTEREST_IMAGE_PATH = '/assets/sitios%20de%20interes.jpg';
const brochureFiles = {
  desktop: {
    es: '/brochure/Brochure horizontal.pdf',
    en: '/brochure/Brochure english horizontal.pdf',
  },
  mobile: {
    es: '/brochure/Brochure vertical.pdf',
    en: '/brochure/Brochure vertical ingles.pdf',
  },
};

const BROCHURE_LOCK_PAGE = 10;

// 1. DEFINIMOS LAS 6 VISTAS
const vistasDesktop = [
  { nombre: '1', src: '/assets/vistas/1.png' },
  { nombre: '2', src: '/assets/vistas/2.png' },
  { nombre: '3', src: '/assets/vistas/3.png' },
  { nombre: '4', src: '/assets/vistas/4.png' },
];

const vistasMobile = [
  { nombre: '1', src: '/assets/vistas/mobile1.png' },
  { nombre: '2', src: '/assets/vistas/mobile2.png' },
  { nombre: '3', src: '/assets/vistas/mobile3.png' },
  { nombre: '4', src: '/assets/vistas/mobile4.png' },
  { nombre: '5', src: '/assets/vistas/mobile5.png' },
  { nombre: '6', src: '/assets/vistas/mobile6.png' },
];

export default function Home() {
  const [cookieConsent, setCookieConsent] = useState<'all' | 'essential' | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const {
    lotes,
    loading,
    error,
    financeSettings,
    loadingFinanceSettings,
    selectedIds,
    selectedLots,
    porcentajeEnganche,
    meses,
    totales,
    toggleLote,
    limpiarSeleccion,
    actualizarPorcentaje,
    actualizarMeses,
  } = useCotizacion();

  const { status, error: imagineError, generate, lastPrompt, result } = useImagine();
  const { user } = useAuth();
  const { language, translations } = useLanguage();

  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState('');
  const promptLoaded = useRef(false);
  const [panelMacroAbierto, setPanelMacroAbierto] = useState(false);

  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [brochureUnlocked, setBrochureUnlocked] = useState(false);
  const [showBrochureContactModal, setShowBrochureContactModal] = useState(false);
  const [brochureGateDismissedPage, setBrochureGateDismissedPage] = useState<number | null>(null);
  const [brochureCurrentPage, setBrochureCurrentPage] = useState<number | null>(null);
  const [brochureTotalPages, setBrochureTotalPages] = useState<number | null>(null);

  // Inicialización
  const [fondoActual, setFondoActual] = useState(vistasDesktop[0].src);
  const [vistaActiva, setVistaActiva] = useState<number | null>(0);
  const [fading, setFading] = useState(false);
  const [infoPanelReset, setInfoPanelReset] = useState(0);
  const [vistas, setVistas] = useState(vistasDesktop);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedImage = window.localStorage.getItem(LAST_IMAGE_KEY);
      if (storedImage) {
        setFondoActual(storedImage);
      }
    }
  }, []);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (storedConsent === 'all' || storedConsent === 'essential') {
      setCookieConsent(storedConsent);
      return;
    }
    setShowCookieBanner(true);
  }, []);

  useEffect(() => {
    if (!promptLoaded.current && lastPrompt) {
      setPrompt(lastPrompt);
      promptLoaded.current = true;
    }
  }, [lastPrompt]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const updateVistas = (matches: boolean) => {
      const vistasObjetivo = matches ? vistasMobile : vistasDesktop;
      setVistas(vistasObjetivo);
      setVistaActiva((prev) => {
        if (prev !== null && prev < vistasObjetivo.length) return prev;
        return 0;
      });

      setFondoActual((actual) => {
        if (!actual) return vistasObjetivo[0]?.src ?? actual;
        const sigueDisponible = vistasObjetivo.some((vista) => vista.src === actual);
        const isCustomBackground =
          actual.startsWith('data:') || actual.startsWith('/IA/') || actual.startsWith('http');
        if (sigueDisponible || isCustomBackground) return actual;
        return vistasObjetivo[0]?.src ?? actual;
      });
    };

    updateVistas(mediaQuery.matches);
    setIsMobileViewport(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      updateVistas(event.matches);
      setIsMobileViewport(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (status !== 'success') return;
    const imageUrl = getImagineImageSrc(result ?? null);
    if (!imageUrl) return;
    setFading(true);
    const timer = setTimeout(() => {
      setFondoActual(imageUrl);
      setFading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [result, status]);

  const handleImagineSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const size = isMobileViewport ? '1024x1536' : '1536x1024';
    await generate(prompt, size);
  };

  const handleImagineShortcut = (value: string, index: number) => {
    setPrompt(value);
    if (!isMobileViewport) return;
    const mobileViewIndex = [1, 2, 3][index];
    if (mobileViewIndex === undefined) return;
    handleCambioVista(mobileViewIndex);
  };

  const handleCambioVista = (index: number) => {
    const vista = vistas[index];
    if (!vista) return;
    setInfoPanelReset((value) => value + 1);
    if (vista.src === fondoActual) {
      setVistaActiva(index);
      return;
    }
    setVistaActiva(index);
    setFading(true);
    setTimeout(() => {
      setFondoActual(vista.src);
      setFading(false);
    }, 200);
  };

  const handleIncreaseFontScale = () => {
    setFontScale((current) => clampFontScale(current + 0.1));
  };

  const handleDecreaseFontScale = () => {
    setFontScale((current) => clampFontScale(current - 0.1));
  };

  const handleCookieChoice = (choice: 'all' | 'essential') => {
    setCookieConsent(choice);
    localStorage.setItem('cookieConsent', choice);
    setShowCookieBanner(false);
  };

  const handleOpenCookieBanner = () => {
    setShowCookieBanner(true);
  };

  const handleOpenInterestModal = () => {
    setShowInterestModal(true);
  };

  const handleCloseInterestModal = () => {
    setShowInterestModal(false);
  };

  const brochureUrl = (isMobileViewport ? brochureFiles.mobile : brochureFiles.desktop)[
    language === 'fr' ? 'en' : language
  ];

  const handleOpenBrochureModal = () => {
    setBrochureUnlocked(false);
    setShowBrochureContactModal(false);
    setBrochureGateDismissedPage(null);
    setBrochureCurrentPage(null);
    setBrochureTotalPages(null);
    setShowBrochureModal(true);
  };

  const handleCloseBrochureModal = () => {
    setShowBrochureModal(false);
    setShowBrochureContactModal(false);
    setBrochureUnlocked(false);
    setBrochureGateDismissedPage(null);
  };

  const handleBrochureFormSubmit = async (formData: CreateContactSubmissionPayload) => {
    await createContactSubmission(formData);
    setBrochureUnlocked(true);
    setShowBrochureContactModal(false);
    setBrochureGateDismissedPage(null);
  };

  const handleBrochureUnlockRequest = (page: number) => {
    if (brochureUnlocked) return;
    if (brochureGateDismissedPage && brochureGateDismissedPage === page) return;
    setBrochureGateDismissedPage(null);
    setShowBrochureContactModal(true);
  };

  const handleOpenBrochureContactManually = () => {
    setBrochureGateDismissedPage(null);
    setShowBrochureContactModal(true);
  };

  const handleCloseBrochureContactModal = () => {
    setShowBrochureContactModal(false);
    setBrochureGateDismissedPage(brochureCurrentPage);
  };

  useEffect(() => {
    let cancelled = false;
    const preload = async () => {
      const mod = await import('@/components/home/BrochureViewer');
      if (cancelled) return;
      mod.preloadBrochureViewerAssets?.(brochureUrl);
    };
    preload();
    return () => {
      cancelled = true;
    };
  }, [brochureUrl]);

  // --- LÓGICA DEL CARRUSEL VERTICAL (DESKTOP) ---
  const vistasDinamicas = vistas.slice(1);
  const ITEM_HEIGHT_WITH_GAP = 116;
  const activeIndex = vistaActiva ?? 0;
  const VISIBLE_ITEMS = 3;
  const maxScrollIndex = Math.max(0, vistasDinamicas.length - VISIBLE_ITEMS);
  const idealOffset = Math.max(0, activeIndex - 2);
  const scrollOffset = Math.min(idealOffset, maxScrollIndex);

  return (
    <>
      <Head>
        <title>{translations.home.meta.title}</title>
        <meta name="description" content={translations.home.meta.description} />
      </Head>

      <main className="min-h-screen bg-white text-slate-900 scroll-smooth">
        <HeroLanding />

        {/* ============================ */}
        {/* SECCIÓN MACRO TERRENO        */}
        {/* ============================ */}
        <section
          id="macro-terreno"
          className="relative isolate min-h-screen overflow-hidden text-white"
        >
          <InteractiveMap
            src={fondoActual}
            imageClassName={isMobileViewport ? 'object-contain object-top' : 'object-cover'}
            className={`absolute inset-0 z-1 transition-opacity duration-500 
              ${fading ? 'opacity-0' : 'opacity-100'}
              ${isMobileViewport ? 'bg-slate-900' : ''}
            `}
          />

          <InfoPanel closeSignal={infoPanelReset} />

          <div className="absolute top-6 left-6 z-30 flex gap-3">
            <button
              type="button"
              onClick={handleOpenInterestModal}
              className="hidden items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-lg ring-1 ring-white/40 transition hover:scale-[1.02] sm:inline-flex"
            >
              {translations.home.actions.interest}
            </button>

            <button
              type="button"
              onClick={handleOpenBrochureModal}
              className="hidden items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-lg ring-1 ring-white/40 transition hover:scale-[1.02] sm:inline-flex"
            >
              {translations.home.actions.brochure}
            </button>

            <div
              className="hidden items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-[#0F172A] shadow-lg ring-1 ring-white/40 transition hover:scale-[1.02] sm:inline-flex"
              role="group"
              aria-label={translations.home.actions.textSize}
            >
              <button
                type="button"
                onClick={handleDecreaseFontScale}
                aria-label={translations.home.actions.decreaseText}
                className="rounded-full px-2 py-1 transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F172A]"
              >
                A-
              </button>

              <div className="h-5 w-px bg-slate-300/70" aria-hidden="true" />

              <button
                type="button"
                onClick={handleIncreaseFontScale}
                aria-label={translations.home.actions.increaseText}
                className="rounded-full px-2 py-1 transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F172A]"
              >
                A+
              </button>
            </div>
          </div>

          <div className="absolute top-6 right-6 z-30 flex items-center gap-3 sm:flex-col sm:items-end">
            <LanguageSelector />
            <AdminAccessLink mounted={mounted} user={user} className="relative" />
          </div>

          <div className="absolute top-8 left-1/2 z-20 -translate-x-1/2">
            <Image
              src="/assets/GD.png"
              alt="Logo Gran Dzilam"
              width={140}
              height={140}
              className="h-20 w-20 object-contain sm:h-28 sm:w-28"
              priority
            />
          </div>

          <ViewSelectorDesktop
            vistas={vistas}
            vistaActiva={vistaActiva}
            onChange={handleCambioVista}
            scrollOffset={scrollOffset}
            itemHeightWithGap={ITEM_HEIGHT_WITH_GAP}
          />

          <ImaginePanel
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleImagineSubmit}
            onShortcut={handleImagineShortcut}
            status={status}
            imagineError={imagineError}
          />

          <MacroCotizadorPanel
            panelMacroAbierto={panelMacroAbierto}
            onToggle={() => setPanelMacroAbierto((value) => !value)}
            loading={loading}
            error={error}
            lotes={lotes}
            selectedIds={selectedIds}
            toggleLote={toggleLote}
            selectedLots={selectedLots}
            porcentajeEnganche={porcentajeEnganche}
            meses={meses}
            totales={totales}
            configuracion={financeSettings}
            configuracionCargando={loadingFinanceSettings}
            onPorcentajeChange={actualizarPorcentaje}
            onMesesChange={actualizarMeses}
            onLimpiar={limpiarSeleccion}
          />

          {/* ... MODALES (Brochure, Interest, Contact) ... */}
          {showBrochureModal ? (
            <div
              className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/80 p-4"
              onClick={handleCloseBrochureModal}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCloseBrochureModal();
                  }}
                  className="absolute right-4 top-4 z-20 rounded-full bg-slate-900/85 px-3 py-1 text-[11px] font-semibold text-white shadow transition hover:bg-slate-900"
                >
                  {translations.home.brochureModal.close}
                </button>

                <div className="relative h-[75vh] bg-slate-100">
                  {brochureUnlocked ? (
                    <div className="absolute left-4 top-4 z-10 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      {translations.home.brochureModal.unlocked}
                    </div>
                  ) : null}

                  <BrochureViewer
                    url={brochureUrl}
                    unlockGatePage={BROCHURE_LOCK_PAGE}
                    unlocked={brochureUnlocked}
                    blurNotice={translations.home.brochureModal.blurNotice}
                    unlockHint={translations.home.brochureModal.unlockHint}
                    onUnlockRequest={handleBrochureUnlockRequest}
                    onPageChange={setBrochureCurrentPage}
                    onDocumentLoad={setBrochureTotalPages}
                  />

                  {!brochureUnlocked ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 left-0 right-0 z-10 flex justify-end px-4 pb-4">
                      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 text-[11px] font-semibold text-slate-800 shadow-lg">
                        <span>
                          {translations.home.brochureModal.blurNotice}{' '}
                          {brochureCurrentPage && brochureTotalPages
                            ? `${brochureCurrentPage}/${brochureTotalPages}`
                            : ''}
                        </span>
                        <button
                          type="button"
                          onClick={handleOpenBrochureContactManually}
                          className="rounded-full bg-[#0F172A] px-3 py-1 text-[11px] font-semibold text-white transition hover:scale-[1.02]"
                        >
                          {translations.home.brochureModal.submitLabel}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {showBrochureContactModal && !brochureUnlocked ? (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4"
              role="dialog"
              aria-modal="true"
              onClick={handleCloseBrochureContactModal}
            >
              <div
                className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCloseBrochureContactModal();
                  }}
                  className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/85 px-3 py-1 text-[11px] font-semibold text-white shadow transition hover:bg-slate-900"
                >
                  {translations.home.brochureModal.close}
                </button>

                <div className="space-y-3 px-6 pb-6 pt-10">
                  <p className="text-lg font-bold text-slate-900">
                    {translations.home.brochureModal.contactTitle}
                  </p>
                  <p className="text-sm text-slate-600">
                    {translations.home.brochureModal.contactDescription}
                  </p>
                  <ContactForm
                    className="!px-0 !pt-0"
                    submitLabel={translations.home.brochureModal.submitLabel}
                    onSubmit={handleBrochureFormSubmit}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {showInterestModal ? (
            <div
              className="fixed inset-0 z-[60] hidden items-center justify-center bg-slate-950/80 sm:flex"
              onClick={handleCloseInterestModal}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative m-6 h-[80vh] w-[min(1200px,90vw)] overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleCloseInterestModal}
                  className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-slate-900"
                >
                  {translations.home.interestModal.close}
                </button>
                <div className="relative h-full w-full">
                  <Image
                    src={INTEREST_IMAGE_PATH}
                    alt={translations.home.interestModal.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1200px) 90vw, 1200px"
                  />
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg bg-white/90 px-4 py-2 text-sm text-slate-900 shadow">
                  <p className="font-semibold">{translations.home.interestModal.description}</p>
                  <Link
                    href={INTEREST_IMAGE_PATH}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    {translations.home.interestModal.openNew}
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <footer className="bg-[#0F172A] text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">{translations.home.footer.title}</p>
              <p className="text-xs text-white/70">{translations.home.footer.description}</p>
              {cookieConsent ? (
                <p className="pt-2 text-[11px] text-white/60">
                  {translations.home.footer.preference}:{' '}
                  {cookieConsent === 'all'
                    ? translations.cookies.actions.all.toLowerCase()
                    : translations.cookies.actions.essential.toLowerCase()}
                  .
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="/aviso-de-privacidad"
                className="rounded-full border border-white/30 px-4 py-2 transition hover:border-white hover:bg-white hover:text-[#0F172A]"
              >
                {translations.home.footer.privacy}
              </Link>
              <button
                type="button"
                onClick={handleOpenCookieBanner}
                className="rounded-full bg-white px-4 py-2 text-[#0F172A] transition hover:scale-[1.01]"
              >
                {translations.home.footer.cookies}
              </button>
            </div>
          </div>
        </footer>
      </main>

      {showCookieBanner ? <CookieBanner onChoice={handleCookieChoice} /> : null}

      <ChatbotWidget />
    </>
  );
}
