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
  { ssr: false }
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
    lotes, loading, error, financeSettings, loadingFinanceSettings,
    selectedIds, selectedLots, porcentajeEnganche, meses, totales,
    toggleLote, limpiarSeleccion, actualizarPorcentaje, actualizarMeses,
  } = useCotizacion();

  const { status, error: imagineError, generate, lastPrompt, result } = useImagine();
  const { user } = useAuth();
  const { language, translations } = useLanguage();

  const [mounted, setMounted] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const clampFontScale = (value: number) => Math.min(Math.max(value, 0.9), 1.2);
  const [prompt, setPrompt] = useState('');
  const promptLoaded = useRef(false);
  const [panelMacroAbierto, setPanelMacroAbierto] = useState(false);

  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [brochureUnlocked, setBrochureUnlocked] = useState(false);
  const [showBrochureContactModal, setShowBrochureContactModal] = useState(false);
  const [brochureCurrentPage, setBrochureCurrentPage] = useState<number | null>(null);
  const [brochureTotalPages, setBrochureTotalPages] = useState<number | null>(null);
  const [brochureGateDismissedPage, setBrochureGateDismissedPage] = useState<number | null>(null);

  const [fondoActual, setFondoActual] = useState(vistasDesktop[0].src);
  const [vistaActiva, setVistaActiva] = useState<number | null>(0);
  const [fading, setFading] = useState(false);
  const [infoPanelReset, setInfoPanelReset] = useState(0);
  const [vistas, setVistas] = useState(vistasDesktop);

  useEffect(() => { setMounted(true); }, []);

  // Sync font scale from local storage
  useEffect(() => {
    const storedFontScale = localStorage.getItem('fontScale');
    if (!storedFontScale) return;
    const parsedScale = Number.parseFloat(storedFontScale);
    if (Number.isNaN(parsedScale)) return;
    setFontScale(clampFontScale(parsedScale));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${16 * fontScale}px`);
    localStorage.setItem('fontScale', fontScale.toString());
  }, [fontScale]);

  // Sync background image from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedImage = window.localStorage.getItem(LAST_IMAGE_KEY) ?? '';
      const sanitizedImage = storedImage.trim();
      if (!sanitizedImage || (sanitizedImage.startsWith('data:') && sanitizedImage.length > 4096)) return;
      setFondoActual(sanitizedImage);
    }
  }, []);

  // Check cookie consent
  useEffect(() => {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (storedConsent === 'all' || storedConsent === 'essential') {
      setCookieConsent(storedConsent as 'all' | 'essential');
      return;
    }
    setShowCookieBanner(true);
  }, []);

  // Update prompt from Imagine hook
  useEffect(() => {
    if (!promptLoaded.current && lastPrompt) {
      setPrompt(lastPrompt);
      promptLoaded.current = true;
    }
  }, [lastPrompt]);

  // Handle viewport resize and view switching
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateVistas = (matches: boolean) => {
      const vistasObjetivo = matches ? vistasMobile : vistasDesktop;
      setVistas(vistasObjetivo);
      setVistaActiva((prev) => (prev !== null && prev < vistasObjetivo.length ? prev : 0));
      setFondoActual((actual) => {
        if (!actual) return vistasObjetivo[0]?.src ?? actual;
        const sigueDisponible = vistasObjetivo.some((vista) => vista.src === actual);
        const isCustom = actual.startsWith('data:') || actual.startsWith('/IA/') || actual.startsWith('http');
        return (sigueDisponible || isCustom) ? actual : vistasObjetivo[0]?.src;
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

  // Update background when AI generation is successful
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
    if (mobileViewIndex !== undefined) handleCambioVista(mobileViewIndex);
  };

  const handleCambioVista = (index: number) => {
    const vista = vistas[index];
    if (!vista) return;
    setInfoPanelReset((v) => v + 1);
    setVistaActiva(index);
    if (vista.src === fondoActual) return;
    setFading(true);
    setTimeout(() => {
      setFondoActual(vista.src);
      setFading(false);
    }, 200);
  };

  const handleIncreaseFontScale = () => setFontScale((c) => clampFontScale(c + 0.1));
  const handleDecreaseFontScale = () => setFontScale((c) => clampFontScale(c - 0.1));

  const handleCookieChoice = (choice: 'all' | 'essential') => {
    setCookieConsent(choice);
    localStorage.setItem('cookieConsent', choice);
    setShowCookieBanner(false);
  };

  const brochureUrl = (isMobileViewport ? brochureFiles.mobile : brochureFiles.desktop)[
    language === 'fr' ? 'en' : language as 'es' | 'en'
  ];

  const handleOpenBrochureModal = () => {
    setBrochureUnlocked(false);
    setShowBrochureContactModal(false);
    setBrochureGateDismissedPage(null);
    setBrochureCurrentPage(null);
    setBrochureTotalPages(null);
    setShowBrochureModal(true);
  };

  const handleBrochureFormSubmit = async (formData: CreateContactSubmissionPayload) => {
    await createContactSubmission(formData);
    setBrochureUnlocked(true);
    setShowBrochureContactModal(false);
  };

  const handleBrochureUnlockRequest = (page: number) => {
    if (!brochureUnlocked && brochureGateDismissedPage !== page) {
      setShowBrochureContactModal(true);
    }
  };

  const ITEM_HEIGHT_WITH_GAP = 116;
  const activeIndex = vistaActiva ?? 0;
  const VISIBLE_ITEMS = 3;
  const maxScrollIndex = Math.max(0, vistas.slice(1).length - VISIBLE_ITEMS);
  const scrollOffset = Math.min(Math.max(0, activeIndex - 2), maxScrollIndex);

  return (
    <>
      <Head>
        <title>{translations.home.meta.title}</title>
        <meta name="description" content={translations.home.meta.description} />
      </Head>

      <main className="min-h-screen bg-white text-slate-900 scroll-smooth">
        <HeroLanding />

        <section id="macro-terreno" className="relative isolate min-h-screen overflow-hidden text-white">
          <InteractiveMap
            src={fondoActual}
            imageClassName={isMobileViewport ? 'object-contain object-top' : 'object-cover'}
            className={`absolute inset-0 z-1 transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'} ${isMobileViewport ? 'bg-slate-900' : ''}`}
          />

          <InfoPanel closeSignal={infoPanelReset} />

          {/* Nav Actions */}
          <div className="absolute top-6 left-6 z-30 flex gap-3">
            <button type="button" onClick={() => setShowInterestModal(true)} className="hidden items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-lg transition hover:scale-[1.02] sm:inline-flex">
              {translations.home.actions.interest}
            </button>
            <button type="button" onClick={handleOpenBrochureModal} className="hidden items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-lg transition hover:scale-[1.02] sm:inline-flex">
              {translations.home.actions.brochure}
            </button>
            <div className="hidden items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-[#0F172A] shadow-lg sm:inline-flex" role="group">
              <button type="button" onClick={handleDecreaseFontScale} className="rounded-full px-2 py-1 transition hover:bg-white/80">A-</button>
              <div className="h-5 w-px bg-slate-300/70" />
              <button type="button" onClick={handleIncreaseFontScale} className="rounded-full px-2 py-1 transition hover:bg-white/80">A+</button>
            </div>
          </div>

          <div className="absolute top-6 right-6 z-30 flex items-center gap-3 sm:flex-col sm:items-end">
            <LanguageSelector />
            <AdminAccessLink mounted={mounted} user={user} className="relative" />
          </div>

          <div className="absolute top-8 left-1/2 z-20 -translate-x-1/2">
            <Image src="/assets/GD.png" alt="Logo Gran Dzilam" width={140} height={140} className="h-20 w-20 object-contain sm:h-28 sm:w-28" priority />
          </div>

          <ViewSelectorDesktop vistas={vistas} vistaActiva={vistaActiva} onChange={handleCambioVista} scrollOffset={scrollOffset} itemHeightWithGap={ITEM_HEIGHT_WITH_GAP} />

          <ImaginePanel prompt={prompt} onPromptChange={setPrompt} onSubmit={handleImagineSubmit} onShortcut={handleImagineShortcut} status={status} imagineError={imagineError} />

          {/* ============================================================ */}
          {/* BLOQUE DE POSICIONAMIENTO FIJO PARA CENTRADO ABSOLUTO (<411px) */}
          {/* ============================================================ */}
          <div
            className="fixed bottom-0 z-[100] pointer-events-none"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100vw',
              display: 'flex',
              justifyContent: 'center',
              paddingBottom: '2rem'
            }}
          >
            <div className="pointer-events-auto w-full max-w-[92%] flex justify-center">
              <MacroCotizadorPanel
                panelMacroAbierto={panelMacroAbierto}
                onToggle={() => setPanelMacroAbierto(!panelMacroAbierto)}
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
            </div>
          </div>
          {/* ============================================================ */}

          {/* Modales */}
          {showBrochureModal && (
            <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/80 p-4" onClick={() => setShowBrochureModal(false)} role="dialog" aria-modal="true">
              <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => setShowBrochureModal(false)} className="absolute right-4 top-4 z-20 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white">
                  {translations.home.brochureModal.close}
                </button>
                <div className="relative h-[75vh] bg-slate-100">
                  <BrochureViewer url={brochureUrl} unlockGatePage={BROCHURE_LOCK_PAGE} unlocked={brochureUnlocked} onUnlockRequest={handleBrochureUnlockRequest} onPageChange={setBrochureCurrentPage} onDocumentLoad={setBrochureTotalPages} />
                </div>
              </div>
            </div>
          )}

          {showBrochureContactModal && !brochureUnlocked && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4" onClick={() => { setShowBrochureContactModal(false); setBrochureGateDismissedPage(brochureCurrentPage); }}>
              <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <p className="text-lg font-bold mb-2">{translations.home.brochureModal.contactTitle}</p>
                <ContactForm onSubmit={handleBrochureFormSubmit} submitLabel={translations.home.brochureModal.submitLabel} />
              </div>
            </div>
          )}

          {showInterestModal && (
            <div className="fixed inset-0 z-[60] hidden items-center justify-center bg-slate-950/80 sm:flex" onClick={() => setShowInterestModal(false)}>
              <div className="relative h-[80vh] w-[min(1200px,90vw)] overflow-hidden rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
                <Image src={INTEREST_IMAGE_PATH} alt="Interés" fill className="object-contain" />
              </div>
            </div>
          )}
        </section>

        <footer className="bg-[#0F172A] text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold">{translations.home.footer.title}</p>
            <div className="flex gap-3">
              <Link href="/aviso-de-privacidad" className="rounded-full border border-white/30 px-4 py-2 text-sm">{translations.home.footer.privacy}</Link>
              <button type="button" onClick={() => setShowCookieBanner(true)} className="rounded-full bg-white px-4 py-2 text-sm text-[#0F172A]">{translations.home.footer.cookies}</button>
            </div>
          </div>
        </footer>
      </main>

      {showCookieBanner && <CookieBanner onChoice={handleCookieChoice} />}
      <ChatbotWidget />
    </>
  );
}