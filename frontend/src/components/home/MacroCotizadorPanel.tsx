import Image from 'next/image';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatearMoneda } from '@/lib/formatoMoneda';
import { MapaLotes } from '@/components/mapa/MapaLotes';
import { PanelCotizacion } from '@/components/panel/PanelCotizacion';
import { ContactForm } from '@/components/common/ContactForm';
import { createContactSubmission } from '@/lib/contactSubmissions';

import type { Lote, TotalesCotizacion } from '@/hooks/useCotizacion';
import type { FinanceSettingsDTO } from '@/lib/financeSettings';

interface MacroCotizadorPanelProps {
  panelMacroAbierto: boolean;
  onToggle: () => void;
  loading: boolean;
  error: string | null;
  lotes: Lote[];
  selectedIds: string[];
  toggleLote: (id: string) => void;
  selectedLots: Lote[];
  porcentajeEnganche: number;
  meses: number;
  totales: TotalesCotizacion;
  configuracion: FinanceSettingsDTO;
  configuracionCargando: boolean;
  onPorcentajeChange: (valor: number) => void;
  onMesesChange: (valor: number) => void;
  onLimpiar: () => void;
}

export const MacroCotizadorPanel = ({
  panelMacroAbierto,
  onToggle,
  loading,
  error,
  lotes,
  selectedIds,
  toggleLote,
  selectedLots,
  porcentajeEnganche,
  meses,
  totales,
  configuracion,
  configuracionCargando,
  onPorcentajeChange,
  onMesesChange,
  onLimpiar,
}: MacroCotizadorPanelProps) => {
  const { translations, language } = useLanguage();
  const macroCopy = translations.macro;
  const panelCopy = translations.panel;
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const formatCurrency = (valor: number) => formatearMoneda(valor, 'MXN');
  const formatArea = (valor: number) =>
    `${valor.toLocaleString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} m²`;
  const fechaCotizacion = new Date().toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-MX');
  const totalArea = selectedLots.reduce((acum, lote) => acum + (lote.superficieM2 || 0), 0);

  const handleToggleMain = () => {
    if (panelMacroAbierto) {
      setIsContactOpen(false);
      setDownloadRequested(false);
    }
    onToggle();
  };

  const handleCloseOverlay = () => {
    setIsContactOpen(false);
    setDownloadRequested(false);
  };

  const handleContactRequest = () => {
    setDownloadRequested(false);
    setIsContactOpen(true);
  };

  const handleDownloadRequest = () => {
    setDownloadRequested(true);
    setIsContactOpen(true);
  };

  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleFormSubmit = async (formData: { nombre: string; correo: string; telefono: string; interes: string }) => {
    await createContactSubmission(formData);

    setIsContactOpen(false);

    if (!downloadRequested) return;

    await new Promise((resolve) => setTimeout(resolve, 300));
    await generatePdf();
    setDownloadRequested(false);
  };

  return (
    <div
      id="macro-cotizador-panel"
      className={`
        absolute bottom-8 left-0 right-0 pb-[5%] px-4
        flex flex-col-reverse items-stretch
        pointer-events-none z-[50]
        sm:pb-0 sm:left-[150px] sm:right-8 sm:px-0 sm:pr-0
      `}
    >
      {/* 1. BOTÓN FLOTANTE */}
      <button
        type="button"
        onClick={handleToggleMain}
        className={`
          pointer-events-auto
          group relative flex w-full max-w-[520px] items-center gap-4 
          bg-[#F3F1EC] px-6 py-4 text-left outline-none 
          transition-all duration-300 hover:bg-[#EBE9E4]
          border border-[#E2E0DB] shadow-lg
          z-[60] mx-auto sm:mx-0 sm:max-w-none
          ${panelMacroAbierto
            ? 'rounded-b-[20px] rounded-t-none border-t-0'
            : 'rounded-[100px]'
          }
        `}
      >
        <span
          className={`
            flex h-8 w-8 items-center justify-center rounded-full border border-[#1C2E3D]
            text-[#1C2E3D] transition-transform duration-300
            ${panelMacroAbierto ? 'rotate-0' : 'rotate-0'}
          `}
        >
          {panelMacroAbierto ? (
            <svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
          )}
        </span>
        <span className="font-serif  text-[22px] sm:text-[28px] font-normal text-[#1C2E3D] leading-none pb-1">
          {macroCopy.toggle}
        </span>
      </button>

      {/* 2. CONTENEDOR DESPLEGABLE */}
      <div
        className={`
          pointer-events-auto
          overflow-hidden bg-[#F3F1EC] 
          transition-all duration-500 ease-in-out
          border-x border-t border-[#E2E0DB]
          shadow-xl
          relative
          ${panelMacroAbierto
            ? 'max-h-[85vh] opacity-100 rounded-[20px] sm:rounded-t-[20px]'
            : 'max-h-0 opacity-0 border-none'
          }
        `}
      >
        {/* FONDO (MAPA + PANEL) */}
        <div className="flex flex-col h-full w-full">
          <p className="px-6 pt-4 pb-2 text-xs text-[#1C2533] lg:px-8 bg-[#F3F1EC] shrink-0">
            {macroCopy.disclaimer}
          </p>

          <div className="grid h-full w-full lg:grid-cols-[1fr_460px] bg-[#F3F1EC] overflow-hidden flex-1">
            <div className="relative h-full w-full p-4 lg:p-6">
              <div className="relative h-full h-[96%] w-[70%] pl-[10%] overflow-hidden rounded-2xl bg-[#F3F1EC]">
                <Image
                  src="/assets/vistas/COTIZACION2.jpg"
                  alt="Mapa de referencia Gran Dzilam"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={false}
                />

                {loading ? (
                  <div className="flex h-full items-center justify-center gap-4 text-[#64748B]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1C2533] border-t-transparent" />
                    <p>{macroCopy.loading}</p>
                  </div>
                ) : error ? (
                  <div className="flex h-full items-center justify-center p-8 text-center text-red-500">{error}</div>
                ) : lotes.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-[#1C2533]"><p>{macroCopy.empty}</p></div>
                ) : (
                  <div className="absolute inset-0 h-full w-full overflow-hidden">
                    <MapaLotes lotes={lotes} seleccionados={selectedIds} onToggle={toggleLote} />
                  </div>
                )}
              </div>
            </div>

            <div className="h-full border-l border-[#E2E0DB] bg-[#F3F1EC] overflow-y-auto overlay-scrollbar">
              <PanelCotizacion
                lotesSeleccionados={selectedLots}
                porcentajeEnganche={porcentajeEnganche}
                meses={meses}
                totales={totales}
                configuracion={configuracion}
                configuracionCargando={configuracionCargando}
                onPorcentajeChange={onPorcentajeChange}
                onMesesChange={onMesesChange}
                onLimpiar={onLimpiar}
                onCerrar={onToggle}
                onContactar={handleContactRequest}
                onDescargar={handleDownloadRequest}
                descargaEnProgreso={isGeneratingPdf}
              />
            </div>
          </div>
        </div>

        {/* OVERLAY DEL FORMULARIO */}
        <div
          className={`
            absolute inset-0 z-[100]
            flex flex-col bg-[#F3F1EC]
            transition-all duration-300 ease-in-out
            ${isContactOpen
              ? 'opacity-100 visible pointer-events-auto'
              : 'opacity-0 invisible pointer-events-none'
            }
          `}
        >
          <div className="flex items-center justify-end bg-[#efeeeb] px-4 py-2 shrink-0 border-b border-[#E2E0DB]">
            <button
              type="button"
              onClick={handleCloseOverlay}
              className="rounded-full bg-slate-200 p-2 text-slate-600 hover:bg-slate-300 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-6 overlay-scrollbar">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 px-4 md:px-[80px] font-serif text-3xl text-[#1C2E3D]">
                {downloadRequested ? panelCopy.actions.download : panelCopy.actions.contact}
              </h2>
              <ContactForm
                onSubmit={handleFormSubmit}
                submitLabel={downloadRequested ? panelCopy.actions.download : translations.contact.actions.submit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* === ÁREA DE IMPRESIÓN === */}
      <div id="cotizacion-print" className="hidden">
        <div
          className="relative mx-auto h-full w-full overflow-hidden bg-[#fafafa]"
          // ESTO ES LO QUE HACE QUE SE IMPRIMA EL FONDO:
          style={{
            printColorAdjust: 'exact',
            WebkitPrintColorAdjust: 'exact',
            backgroundColor: '#fafafa' // Refuerzo explícito
          }}
        >
          <Image
            src="/assets/HOJA MEMBRETADA.png"
            alt="Hoja membretada Gran Dzilam"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          {/* Contenedor relativo que ocupa toda la hoja para posicionar hijos absolutos */}
          <div className="relative z-10 h-full w-full">

            {/* 1. Header Fijo (Absoluto arriba derecha) */}
            <div className="absolute top-14 right-12 text-sm font-semibold text-[#1C2533]">
              Fecha: {fechaCotizacion}
            </div>

            {/* 2. Contenido Principal con Padding Inferior grande para no chocar con footer */}
            <div className="px-12 pt-[20%] pb-48 h-full flex flex-col gap-5 text-[#1C2533]">
              {/* Título */}
              <div>
                <h2 className="font-serif text-2xl">Cotización de lotes</h2>
                <p className="text-[#475569]">Estimación en MXN generada automáticamente.</p>
              </div>

              {/* Lista de lotes */}
              <div className="space-y-2 border-b border-gray-200 pb-4">
                {selectedLots.length === 0 ? (
                  <p className="text-[#475569]">No se seleccionaron lotes para esta cotización.</p>
                ) : (
                  selectedLots.map((lote, index) => {
                    const precioLote = lote.precioTotal ?? lote.precio ?? 0;
                    return (
                      <div key={lote.id || index} className="flex items-baseline justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="font-semibold">{lote.nombre || `Lote ${index + 1}`}</span>
                          <span className="text-xs text-[#475569]">{formatArea(lote.superficieM2 || 0)}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-semibold">{formatCurrency(precioLote)}</span>
                          <span className="text-[11px] text-[#16a34a]">Incluye descuento aplicado</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Totales y Financiamiento */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(totales.totalSeleccionado)}</span>
                  </div>
                  <div className="flex justify-between text-[#16a34a]">
                    <span>Descuento ({Math.round(totales.descuentoPorcentaje * 100)}%)</span>
                    <span>-{formatCurrency(totales.descuentoAplicado)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base border-t border-dashed border-gray-300 pt-1 mt-1">
                    <span>Total con descuento</span>
                    <span>{formatCurrency(totales.totalConDescuento)}</span>
                  </div>
                </div>

                <div className="space-y-1 bg-gray-50 p-3 rounded-md border border-gray-100 mt-2 print:bg-transparent print:border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Enganche</span>
                    <span className="font-semibold">{formatCurrency(totales.enganche)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#475569]">{panelCopy.balance}</span>
                    <span className="font-semibold">{formatCurrency(totales.saldoFinanciar)}</span>
                  </div>
                  <div className="flex justify-between font-semibold mt-2">
                    <span>{panelCopy.monthly}</span>
                    <span>{formatCurrency(totales.mensualidad)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#475569]">
                    <span>{panelCopy.monthsLabel}</span>
                    <span>{meses} {panelCopy.monthsLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Footer Fijo (Absoluto abajo) */}
            <div className="mb-[20%] absolute bottom-12 left-12 right-12 text-[#475569] flex flex-col items-center">
              {/* Notas importantes */}
              <div className="w-full text-[12px] leading-relaxed mb-4 text-left">
                <p className="font-semibold text-[#1C2533]">Notas importantes</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  <li>Los montos son informativos y pueden variar según disponibilidad y condiciones comerciales.</li>
                  <li>La superficie total seleccionada es de {formatArea(totalArea)}.</li>
                  <li>Comunícate con nuestro equipo para confirmar precios y disponibilidad.</li>
                </ul>
              </div>

              {/* Texto Legal */}
              <p className="text-[10px] uppercase tracking-wide opacity-60 text-center border-t border-gray-300 w-full pt-2">
                {macroCopy.disclaimer}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroCotizadorPanel;
