import { MapaLotes } from '@/components/mapa/MapaLotes';
import { PanelCotizacion } from '@/components/panel/PanelCotizacion';
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
}: MacroCotizadorPanelProps) => (
  <div
    className={`
      absolute bottom-0 left-[150px] right-0 pr-6 z-40
      transform transition-transform duration-500 ease-in-out
      ${panelMacroAbierto ? 'translate-y-0' : 'translate-y-[calc(100%-72px)]'}
    `}
  >
    <div className="flex w-full flex-col rounded-t-[20px] bg-[#F3F1EC] border border-[#E2E0DB] font-sans text-[#1C2533]">
      <button
        type="button"
        onClick={onToggle}
        className="group relative flex w-full items-center justify-between rounded-t-[20px] bg-white px-6 py-5 text-left outline-none transition-colors hover:bg-[#F8F7F4] lg:px-8"
      >
        <div className="flex items-center gap-5">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${
              panelMacroAbierto
                ? 'bg-[#1C2533] border-[#1C2533] text-white rotate-180'
                : 'bg-white border-[#E2E0DB] text-[#1C2533] group-hover:border-[#1C2533]'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <span className="font-serif text-2xl font-medium text-[#1C2533]">Cotizar macro terreno</span>
        </div>
      </button>

      <p className="px-6 pt-3 text-xs text-[#1C2533] lg:px-8">
        Esta herramienta es una representación ilustrativa y no constituye una oferta oficial ni legal.
      </p>

      <div
        className={`h-[85vh] overflow-hidden border-t border-[#E2E0DB] bg-[#F3F1EC] transition-opacity duration-500 ${
          panelMacroAbierto ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="grid h-full lg:grid-cols-[1fr_460px] bg-[#F3F1EC]">
          <div className="relative flex flex-col p-4 lg:p-6 overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#E2E0DB] bg-[#F3F1EC]">
              {loading ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-[#64748B]">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E2E0DB] border-t-[#1C2533]" />
                  <p className="text-sm font-medium tracking-wide">Cargando disponibilidad...</p>
                </div>
              ) : error ? (
                <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
                  <p className="text-[#64748B]">{error}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="border-b border-[#1C2533] pb-0.5 text-sm font-medium text-[#1C2533] transition-opacity hover:opacity-70"
                  >
                    Reintentar
                  </button>
                </div>
              ) : lotes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F1EC] text-[#1C2533]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3L21 21M4.5 4.5L19.5 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-serif text-xl font-medium text-[#1C2533]">No hay lotes disponibles</p>
                    <p className="mt-2 text-sm text-[#64748B]">Por favor, verifica más tarde para nuevas disponibilidades.</p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  <div className="relative flex-1 bg-[#F3F1EC]/30">
                    <div className="absolute inset-0 overflow-y-auto">
                      <MapaLotes lotes={lotes} seleccionados={selectedIds} onToggle={toggleLote} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-full border-l border-[#E2E0DB] bg-[#F3F1EC]">
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
              onCerrar={() => onToggle()}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
