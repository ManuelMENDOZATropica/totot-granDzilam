import { useState } from 'react';
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
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
        absolute bottom-8 left-[150px] right-8 z-40
        flex flex-col-reverse items-stretch
        pointer-events-none
      `}
    >
      {/* 1. BOTÓN FLOTANTE */}
      <button
        type="button"
        onClick={handleToggleMain}
        className={`
          pointer-events-auto
          group relative flex w-full items-center gap-4 
          bg-[#F3F1EC] px-6 py-4 text-left outline-none 
          transition-all duration-300 hover:bg-[#EBE9E4]
          border border-[#E2E0DB] shadow-lg
          z-[60]
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
        <span className="font-serif text-[28px] font-normal text-[#1C2E3D] leading-none pb-1">
          Cotizar macro terreno
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
            ? 'max-h-[85vh] opacity-100 rounded-t-[20px]' 
            : 'max-h-0 opacity-0 border-none'
          }
        `}
      >
        {/* FONDO (MAPA + PANEL) */}
        <div className="flex flex-col h-full w-full">
          <p className="px-6 pt-4 pb-2 text-xs text-[#1C2533] lg:px-8 bg-[#F3F1EC] shrink-0">
            Esta herramienta es una representación ilustrativa y no constituye una oferta oficial ni legal.
          </p>

          <div className="grid h-full w-full lg:grid-cols-[1fr_460px] bg-[#F3F1EC] overflow-hidden flex-1">
            <div className="relative h-full w-full p-4 lg:p-6">
              <div className="relative h-full w-[80%] pl-[10%] overflow-hidden bg-[#F3F1EC]">
                {loading ? (
                   <div className="flex h-full items-center justify-center gap-4 text-[#64748B]">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1C2533] border-t-transparent" />
                      <p>Cargando...</p>
                   </div>
                ) : error ? (
                   <div className="flex h-full items-center justify-center p-8 text-center text-red-500">{error}</div>
                ) : lotes.length === 0 ? (
                   <div className="flex h-full items-center justify-center text-[#1C2533]"><p>No hay lotes disponibles</p></div>
                ) : (
                  <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#F3F1EC]/30">
                    <MapaLotes lotes={lotes} seleccionados={selectedIds} onToggle={toggleLote} />
                  </div>
                )}
              </div>
            </div>

            <div className="h-full border-l border-[#E2E0DB] bg-[#F3F1EC] overflow-y-auto">
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
                // Conectamos el botón del hijo con el estado del padre
                onContactar={handleContactRequest}
                onDescargar={handleDownloadRequest}
                descargaEnProgreso={isGeneratingPdf}
              />
            </div>
          </div>
        </div>

        {/* OVERLAY DEL FORMULARIO (Encima de todo) */}
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
          <div className="flex-1 overflow-y-auto py-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 px-4 md:px-[80px] font-serif text-3xl text-[#1C2E3D]">
                {downloadRequested ? 'Completa tus datos para descargar tu cotización' : 'Contáctanos'}
              </h2>
              <ContactForm
                onSubmit={handleFormSubmit}
                submitLabel={downloadRequested ? 'Enviar y descargar' : 'Enviar información'}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #macro-cotizador-panel,
          #macro-cotizador-panel * {
            visibility: visible;
          }

          #macro-cotizador-panel {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default MacroCotizadorPanel;