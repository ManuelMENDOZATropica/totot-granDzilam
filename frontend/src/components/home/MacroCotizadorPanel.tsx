import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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
  mensualidadPersonalizada: number | null;
  onMensualidadPersonalizadaChange: (valor: number | null) => void;
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
  mensualidadPersonalizada,
  onMensualidadPersonalizadaChange,
  onLimpiar,
}: MacroCotizadorPanelProps) => {
  const { translations, language } = useLanguage();
  const macroCopy = translations.macro;
  const panelCopy = translations.panel;
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  // Ref al contenedor oculto que vamos a capturar con html2canvas
  const printRef = useRef<HTMLDivElement | null>(null);

  const formatCurrency = (valor: number) => formatearMoneda(valor, 'MXN');
  const formatArea = (valor: number) =>
    `${valor.toLocaleString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} m²`;
  const fechaCotizacion = new Date().toLocaleDateString(
    language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-MX',
  );
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
    const node = printRef.current;
    if (!node) return;
    setIsGeneratingPdf(true);
    try {
      // Hacemos visible el nodo momentneamente para que html2canvas lo capture
      node.style.visibility = 'visible';
      node.style.pointerEvents = 'none';

      // Esperamos a que el browser pinte las imágenes
      await new Promise((resolve) => setTimeout(resolve, 600));

      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas').then((m) => m.default),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,           // alta resolución
        useCORS: true,      // permite imágenes del mismo dominio
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: node.offsetWidth,
        height: node.offsetHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      // Ocupamos toda la hoja A4 (210 x 297 mm)
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save('cotizacion-gran-dzilam.pdf');
    } finally {
      if (node) {
        node.style.visibility = 'hidden';
        node.style.pointerEvents = '';
      }
      setIsGeneratingPdf(false);
    }
  };

  const handleFormSubmit = async (formData: {
    nombre: string;
    correo: string;
    telefono: string;
    interes: string;
  }) => {
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
          ${panelMacroAbierto ? 'rounded-b-[20px] rounded-t-none border-t-0' : 'rounded-[100px]'}
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
            <svg
              width="14"
              height="2"
              viewBox="0 0 14 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 1H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 1V13M1 7H13"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
        <span className="font-serif text-[22px] sm:text-[28px] font-normal text-[#1C2E3D] leading-none pb-1">
          {macroCopy.toggle}
        </span>
      </button>

      {/* 2. CONTENEDOR DESPLEGABLE */}
      <div
        className={`
          pointer-events-auto
          bg-[#F3F1EC] 
          transition-all duration-500 ease-in-out
          border-x border-t border-[#E2E0DB]
          shadow-xl
          relative flex flex-col
          ${panelMacroAbierto
            ? 'max-h-[85vh] h-[85vh] sm:h-auto opacity-100 rounded-[20px] sm:rounded-t-[20px]'
            : 'max-h-0 opacity-0 border-none overflow-hidden'
          }
        `}
      >
        {/* FONDO (MAPA + PANEL) */}
        {/* !!! CHANGE 1: 'overflow-hidden' aquí es clave para que el scroll interno funcione */}
        <div className="flex flex-col h-full w-full overflow-hidden">
          <p className="px-6 pt-4 pb-2 text-xs text-[#1C2533] lg:px-8 bg-[#F3F1EC] shrink-0">
            {macroCopy.disclaimer}
          </p>

          <div className="flex flex-col lg:grid h-full w-full lg:grid-cols-[1fr_460px] bg-[#F3F1EC] flex-1 min-h-0">
            {/* SECCIÓN IZQUIERDA (Lista móvil / Mapa desktop) */}
            {/* !!! CHANGE 2: 
                - 'shrink-0': No permitas que esto se encoja más de lo debido.
                - 'max-h-[30vh]': Limitamos la altura al 30% de la pantalla en móvil.
                - 'min-h-0': Permite flexbox calcular correctamente el overflow.
            */}
            <div className="relative w-full p-4 lg:p-6 shrink-0 flex flex-col min-h-0 max-h-[30vh] lg:max-h-none lg:h-full">
              {/* LISTA DE LOTES (SOLO MÓVIL) */}
              <div className="lg:hidden h-full flex flex-col min-h-0">
                <div className="rounded-2xl border border-[#E2E0DB] bg-[#F3F1EC] p-4 shadow-sm flex flex-col h-full">
                  <p className="mb-4 text-sm font-semibold text-[#1C2533] shrink-0">
                    Selecciona un lote
                  </p>

                  {/* Contenedor con scroll para los botones */}
                  <div className="flex-1 overflow-y-auto overlay-scrollbar pr-1 min-h-0">
                    {loading ? (
                      <div className="flex items-center justify-center gap-4 py-8 text-[#64748B]">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C2533] border-t-transparent" />
                        <p>{macroCopy.loading}</p>
                      </div>
                    ) : error ? (
                      <div className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">
                        {error}
                      </div>
                    ) : lotes.length === 0 ? (
                      <div className="rounded-xl bg-white p-4 text-center text-sm text-[#1C2533]">
                        {macroCopy.empty}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 pb-2">
                        {lotes.map((lote, index) => {
                          const loteNombre = lote.nombre || `Lote ${index + 1}`;
                          const isSelected = selectedIds.includes(lote.id);
                          return (
                            <button
                              key={lote.id || index}
                              type="button"
                              onClick={() => toggleLote(lote.id)}
                              className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${isSelected
                                ? 'border-[#1C2533] bg-[#1C2533] text-white'
                                : 'border-[#E2E0DB] bg-white text-[#1C2533] hover:bg-[#EBE9E4]'
                                }`}
                            >
                              {loteNombre}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MAPA (SOLO DESKTOP) */}
              <div className="relative hidden h-full w-full overflow-hidden rounded-2xl bg-[#F3F1EC] lg:block">
                <Image
                  src="/assets/vistas/COTIZACION2.png"
                  alt="Mapa de referencia Gran Dzilam"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={false}
                />
                {/* ... (Lógica de loading/error del mapa igual que antes) ... */}
                {loading ? (
                  <div className="flex h-full items-center justify-center gap-4 text-[#64748B]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1C2533] border-t-transparent" />
                    <p>{macroCopy.loading}</p>
                  </div>
                ) : error ? (
                  <div className="flex h-full items-center justify-center p-8 text-center text-red-500">
                    {error}
                  </div>
                ) : lotes.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-[#1C2533]">
                    <p>{macroCopy.empty}</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 h-full w-full overflow-hidden">
                    <MapaLotes lotes={lotes} seleccionados={selectedIds} onToggle={toggleLote} />
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN DERECHA (Controles) */}
            {/* !!! CHANGE 3: 
                - 'flex-1': Toma TODO el espacio restante.
                - 'overflow-y-auto': Si el contenido es alto, haz scroll AQUI.
            */}
            <div className="flex-1 lg:h-full border-l border-[#E2E0DB] bg-[#F3F1EC] overflow-y-auto overlay-scrollbar min-h-0">
              {/* Agregamos padding inferior extra para asegurar que se vea el último botón */}
              <div className="pb-10 lg:pb-0 h-full">
                <PanelCotizacion
                  lotesSeleccionados={selectedLots}
                  porcentajeEnganche={porcentajeEnganche}
                  meses={meses}
                  totales={totales}
                  configuracion={configuracion}
                  configuracionCargando={configuracionCargando}
                  onPorcentajeChange={onPorcentajeChange}
                  onMesesChange={onMesesChange}
                  mensualidadPersonalizada={mensualidadPersonalizada}
                  onMensualidadPersonalizadaChange={onMensualidadPersonalizadaChange}
                  onLimpiar={onLimpiar}
                  onCerrar={onToggle}
                  onContactar={handleContactRequest}
                  onDescargar={handleDownloadRequest}
                  descargaEnProgreso={isGeneratingPdf}
                />
              </div>
            </div>
          </div>
        </div>

        {/* OVERLAY DEL FORMULARIO (Sin cambios mayores, solo asegurando z-index) */}
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
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-6 overlay-scrollbar">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 px-4 md:px-[80px] font-serif text-3xl text-[#1C2E3D]">
                {downloadRequested ? panelCopy.actions.download : panelCopy.actions.contact}
              </h2>
              <ContactForm
                onSubmit={handleFormSubmit}
                submitLabel={
                  downloadRequested
                    ? panelCopy.actions.download
                    : translations.contact.actions.submit
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor de impresión oculto fuera de pantalla — capturado por html2canvas */}
      <div
        ref={printRef}
        aria-hidden="true"
        style={{
          // A4 a 96 dpi: 794 x 1123 px
          width: '794px',
          height: '1123px',
          position: 'fixed',
          left: '-9999px',
          top: '0',
          visibility: 'hidden',
          overflow: 'hidden',
          backgroundColor: '#fafafa',
          zIndex: -1,
        }}
      >
        {/* Imagen de fondo que ocupa el 100% */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/HOJA MEMBRETADA.png"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Contenido encima de la imagen */}
          <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', fontFamily: 'sans-serif', color: '#1C2533' }}>

            {/* Fecha */}
            <div style={{ position: 'absolute', top: 48, right: 48, fontSize: 13, fontWeight: 600 }}>
              Fecha: {fechaCotizacion}
            </div>

            {/* Sección principal de texto */}
            <div style={{ padding: '200px 60px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ fontFamily: 'serif', fontSize: 22, margin: 0, marginBottom: 4 }}>Cotización de lotes</h2>
                <p style={{ color: '#475569', margin: 0, fontSize: 13 }}>Estimación en MXN generada automáticamente.</p>
              </div>

              {/* Lista de lotes */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedLots.length === 0 ? (
                  <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>No se seleccionaron lotes.</p>
                ) : (
                  selectedLots.map((lote, index) => {
                    const precioLote = lote.precioTotal ?? lote.precio ?? 0;
                    return (
                      <div key={lote.id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{lote.nombre || `Lote ${index + 1}`}</span>
                          <span style={{ fontSize: 11, color: '#475569' }}>{formatArea(lote.superficieM2 || 0)}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{formatCurrency(precioLote)}</span>
                          <span style={{ fontSize: 10, color: '#16a34a' }}>Incluye descuento aplicado</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Totales */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(totales.totalSeleccionado)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Descuento ({Math.round(totales.descuentoPorcentaje * 100)}%)</span>
                  <span>-{formatCurrency(totales.descuentoAplicado)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px dashed #d1d5db', paddingTop: 6, marginTop: 4 }}>
                  <span>Total con descuento</span>
                  <span>{formatCurrency(totales.totalConDescuento)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 6, padding: 10, marginTop: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Enganche</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(totales.enganche)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>{panelCopy.balance}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(totales.saldoFinanciar)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 4 }}>
                    <span>{panelCopy.monthly}</span>
                    <span>{formatCurrency(totales.mensualidad)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569' }}>
                    <span>{panelCopy.monthsLabel}</span>
                    <span>{meses} {panelCopy.monthsLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notas al pie */}
            <div style={{ position: 'absolute', bottom: 60, left: 48, right: 48, color: '#475569' }}>
              <div style={{ fontSize: 11, lineHeight: 1.5, marginBottom: 12 }}>
                <p style={{ fontWeight: 600, color: '#1C2533', margin: '0 0 4px' }}>Notas importantes</p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Los montos son informativos y pueden variar según disponibilidad y condiciones comerciales.</li>
                  <li>La superficie total seleccionada es de {formatArea(totalArea)}.</li>
                  <li>Comunícate con nuestro equipo para confirmar precios y disponibilidad.</li>
                </ul>
              </div>
              <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6, textAlign: 'center', borderTop: '1px solid #d1d5db', paddingTop: 8, margin: 0 }}>
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
