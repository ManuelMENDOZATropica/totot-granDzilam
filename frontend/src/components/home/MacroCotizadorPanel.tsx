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
      absolute bottom-8 left-[150px] right-8 z-40
      flex flex-col-reverse items-stretch
      transition-all duration-500 ease-in-out
      pointer-events-none 
    `}
  >
    {/* CAMBIO REALIZADO: 'fixed' -> 'absolute'
       Ahora se posicionará en el bottom-8 del contenedor padre (que debe ser 'relative'),
       no de la pantalla del navegador.
    */}

    {/* pointer-events-none en el padre permite hacer clic "a través" del área vacía 
      alrededor del botón flotante. Reactivamos pointer-events-auto en los hijos.
    */}

    {/* --- BOTÓN FLOTANTE (HEADER) --- */}
    <button
      type="button"
      onClick={onToggle}
      className={`
        pointer-events-auto
        group relative flex w-full items-center gap-4 
        bg-[#F3F1EC] px-6 py-4 text-left outline-none 
        transition-all duration-300 hover:bg-[#EBE9E4]
        border border-[#E2E0DB] shadow-lg
        ${panelMacroAbierto 
          ? 'rounded-b-[20px] rounded-t-none border-t-0' 
          : 'rounded-[100px]' // Píldora completa cuando está cerrado
        }
      `}
    >
      {/* Icono Círculo con + / - */}
      <span
        className={`
          flex h-8 w-8 items-center justify-center rounded-full border border-[#1C2E3D] 
          text-[#1C2E3D] transition-transform duration-300
          ${panelMacroAbierto ? 'rotate-0' : 'rotate-0'}
        `}
      >
        {panelMacroAbierto ? (
          // Icono Menos (-)
          <svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        ) : (
          // Icono Más (+)
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        )}
      </span>

      <span className="font-serif text-[28px] font-normal text-[#1C2E3D] leading-none pb-1">
        Cotizar macro terreno
      </span>
    </button>

    {/* --- CONTENIDO DESPLEGABLE (SE EXPANDE HACIA ARRIBA) --- */}
    <div
      className={`
        pointer-events-auto
        overflow-hidden bg-[#F3F1EC] 
        transition-all duration-500 ease-in-out
        border-x border-t border-[#E2E0DB]
        shadow-xl
        ${panelMacroAbierto 
          ? 'max-h-[85vh] opacity-100 rounded-t-[20px]' 
          : 'max-h-0 opacity-0 border-none'
        }
      `}
    >
      <div className="flex flex-col h-full max-h-[85vh]">
        <p className="px-6 pt-4 pb-2 text-xs text-[#1C2533] lg:px-8 bg-[#F3F1EC]">
          Esta herramienta es una representación ilustrativa y no constituye una oferta oficial ni legal.
        </p>

        {/* GRID PRINCIPAL 
            - h-full w-full: Asegura que ocupe todo el espacio disponible.
            - overflow-hidden: Evita scrollbars en el contenedor principal.
        */}
        <div className="grid h-full w-full lg:grid-cols-[1fr_460px] bg-[#F3F1EC] overflow-hidden">
          
          {/* COLUMNA IZQUIERDA: MAPA */}
          <div className="relative h-full w-full p-4 lg:p-6">
              <div className="relative h-full w-[80%] pl-[10%] overflow-hidden bg-[#F3F1EC]">
              {loading ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-[#64748B]">
                  <div className="h-10 w-10 animate-spin rounded-full ]" />
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
                /* CONTENEDOR DEL MAPA FINAL
                   - absolute inset-0: Fuerza al mapa a ocupar exactamente el espacio del padre.
                   - overflow-hidden: Importante para mapas interactivos (drag/zoom) para que no scrollee la página.
                */
                <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#F3F1EC]/30">
                  <MapaLotes lotes={lotes} seleccionados={selectedIds} onToggle={toggleLote} />
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: PANEL DE COTIZACIÓN */}
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
              onCerrar={() => onToggle()}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);