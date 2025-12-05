import React, { useMemo, useState } from 'react';
import type { Lote, TotalesCotizacion } from '@/hooks/useCotizacion';
import type { FinanceSettingsDTO } from '@/lib/financeSettings';
import { formatearMoneda } from '@/lib/formatoMoneda';

interface PanelCotizacionProps {
  lotesSeleccionados: Lote[];
  porcentajeEnganche: number;
  meses: number;
  totales: TotalesCotizacion;
  configuracion: FinanceSettingsDTO;
  configuracionCargando?: boolean;
  onPorcentajeChange: (valor: number) => void;
  onMesesChange: (valor: number) => void;
  onLimpiar: () => void;
  onCerrar?: () => void;
  // Agregamos esta prop para que el padre sepa cuándo abrir el overlay
  onContactar?: () => void;
  onDescargar?: () => void;
  descargaEnProgreso?: boolean;
}

type Moneda = 'mxn' | 'usd';
type UnidadMedida = 'metric' | 'imperial';

const USD_EXCHANGE_RATE = 17;
const SQM_TO_SQFT = 10.7639;

export const PanelCotizacion = ({
  lotesSeleccionados,
  porcentajeEnganche,
  meses,
  totales,
  configuracion,
  configuracionCargando = false,
  onPorcentajeChange,
  onMesesChange,
  onLimpiar,
  onCerrar,
  // Recibimos la función
  onContactar,
  onDescargar,
  descargaEnProgreso = false,
}: PanelCotizacionProps) => {
  const [moneda, setMoneda] = useState<Moneda>('mxn');
  const [unidadMedida, setUnidadMedida] = useState<UnidadMedida>('metric');

  const etiquetaMedida = unidadMedida === 'metric' ? 'm²' : 'ft²';
  const etiquetaMoneda = moneda === 'mxn' ? 'mxn' : 'usd';

  const formatCurrency = useMemo(() => {
    const currencyCode = moneda === 'mxn' ? 'MXN' : 'USD';
    const divisor = moneda === 'mxn' ? 1 : USD_EXCHANGE_RATE;
    return (valor: number) => formatearMoneda(valor / divisor, currencyCode);
  }, [moneda]);

  const formatArea = useMemo(() => {
    const factor = unidadMedida === 'metric' ? 1 : SQM_TO_SQFT;
    return (valor: number) =>
      `${(valor * factor).toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${etiquetaMedida}`;
  }, [etiquetaMedida, unidadMedida]);

  const totalMetros = lotesSeleccionados.reduce(
    (acum, lote) => acum + lote.superficieM2,
    0
  );

  const colors = {
    bg: '#F3F1EC',
    text: '#1C2533',
    textLight: '#64748B',
    badge: '#E2E0DB'
  };

  return (
    <aside
      className="flex w-full flex-col lg:max-w-[480px] max-h-screen border-l border-[#E2E0DB]"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="flex-1 overflow-y-auto px-8 py-10 lg:px-12 overlay-scrollbar">
        
        <h2 className="mb-10 font-serif text-3xl font-medium text-[#1C2533]">
          Genera tu estimación
        </h2>

        {/* --- Medidas --- */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm font-bold text-[#1C2533]">Medidas</span>
            <div className="flex items-center gap-1 rounded-full bg-[#E2E0DB] p-1 text-[10px] font-medium text-[#1C2533]">
              <button
                type="button"
                onClick={() => setUnidadMedida('metric')}
                className={`rounded-full px-2 py-0.5 transition-colors ${unidadMedida === 'metric' ? 'bg-white shadow text-[#1C2533]' : 'text-[#4b5563]'}`}
              >
                m²
              </button>
              <button
                type="button"
                onClick={() => setUnidadMedida('imperial')}
                className={`rounded-full px-2 py-0.5 transition-colors ${unidadMedida === 'imperial' ? 'bg-white shadow text-[#1C2533]' : 'text-[#4b5563]'}`}
              >
                ft²
              </button>
            </div>
          </div>
          <div className="space-y-2 text-sm text-[#1C2533]">
            {lotesSeleccionados.map((lote, index) => (
              <div key={lote.id || index} className="flex justify-between">
                <span>{lote.nombre || `Lote ${index + 1}`}</span>
                <span>{formatArea(lote.superficieM2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 font-bold">
              <span>TOTAL</span>
              <span>{formatArea(totalMetros)}</span>
            </div>
          </div>
        </div>

        {/* --- Estimación --- */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm font-bold text-[#1C2533]">Estimación de costo</span>
            <div className="flex items-center gap-1 rounded-full bg-[#E2E0DB] p-1 text-[10px] font-medium text-[#1C2533]">
              <button
                type="button"
                onClick={() => setMoneda('mxn')}
                className={`rounded-full px-2 py-0.5 transition-colors ${moneda === 'mxn' ? 'bg-white shadow text-[#1C2533]' : 'text-[#4b5563]'}`}
              >
                mxn
              </button>
              <button
                type="button"
                onClick={() => setMoneda('usd')}
                className={`rounded-full px-2 py-0.5 transition-colors ${moneda === 'usd' ? 'bg-white shadow text-[#1C2533]' : 'text-[#4b5563]'}`}
              >
                usd
              </button>
            </div>
          </div>
          <div className="space-y-3 text-sm text-[#1C2533]">
            {lotesSeleccionados.map((lote, index) => (
              <div key={lote.id || index} className="flex justify-between">
                <span>{lote.nombre || `Lote ${index + 1}`}</span>
                <span>{formatCurrency(lote.precioTotal ?? lote.precio)} {etiquetaMoneda}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold">
              <span>Subtotal</span>
              <span>{formatCurrency(totales.totalSeleccionado)} {etiquetaMoneda}</span>
            </div>
            <div className="flex justify-between text-[#16a34a]">
              <span>Descuento ({Math.round(totales.descuentoPorcentaje * 100)}%)</span>
              <span>-{formatCurrency(totales.descuentoAplicado)} {etiquetaMoneda}</span>
            </div>
            <div className="flex justify-between pb-4 font-bold">
              <span>Total con descuento</span>
              <span>{formatCurrency(totales.totalConDescuento)} {etiquetaMoneda}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Enganche</span>
                <span>{formatCurrency(totales.enganche)} {etiquetaMoneda}</span>
              </div>
              <div className="flex justify-between">
                <span>Saldo</span>
                <span>{formatCurrency(totales.saldoFinanciar)} {etiquetaMoneda}</span>
              </div>
              <div className="flex justify-between">
                <span>Mensualidad</span>
                <span>{formatCurrency(totales.mensualidad)} {etiquetaMoneda}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Sliders --- */}
        <div className="mb-10">
          <h3 className="mb-6 text-sm font-bold text-[#1C2533]">Personaliza tu cotización</h3>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs uppercase tracking-wider text-[#64748B]">
                <span>Enganche</span>
              </div>
              <input
                type="range"
                min={configuracion.minEnganche}
                max={configuracion.maxEnganche}
                step={1}
                value={porcentajeEnganche}
                onChange={(e) => onPorcentajeChange(Number(e.target.value))}
                disabled={configuracionCargando}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#E2E0DB] accent-[#1C2533]"
              />
              <div className="text-right text-sm font-semibold text-[#1C2533]">{porcentajeEnganche}%</div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs uppercase tracking-wider text-[#64748B]">
                <span>Pagos</span>
              </div>
              <input
                type="range"
                min={configuracion.minMeses}
                max={configuracion.maxMeses}
                step={1}
                value={meses}
                onChange={(e) => onMesesChange(Number(e.target.value))}
                disabled={configuracionCargando}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#E2E0DB] accent-[#1C2533]"
              />
              <div className="text-right text-sm font-semibold text-[#1C2533]">{meses} pagos</div>
            </div>
          </div>
        </div>

        {/* --- BOTONES DE ACCIÓN --- */}
        <div className="mb-12 flex gap-4">
          <button
            type="button"
            onClick={onDescargar}
            disabled={descargaEnProgreso}
            className="flex-1 rounded-full bg-[#1C2533] px-4 py-3 text-sm font-medium text-white hover:bg-[#2d3b50] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {descargaEnProgreso ? 'Generando...' : 'Descargar cotización'}
          </button>

          {/* BOTÓN RESTAURADO: Ejecuta la función del padre */}
          <button
            type="button"
            onClick={onContactar}
            className="flex-1 rounded-full border border-[#1C2533] px-4 py-3 text-sm font-medium text-[#1C2533] hover:bg-[#1C2533] hover:text-white transition-colors"
          >
            Contáctanos
          </button>
        </div>

      </div>

      <div className="border-t border-slate-300 bg-[#F3F1EC] px-8 py-6 lg:px-12">
        <button
          onClick={onCerrar || onLimpiar}
          className="group flex items-center gap-4 text-3xl font-serif text-[#1C2533] hover:opacity-80 transition-opacity"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C2533] text-white group-hover:bg-[#2d3b50]">
            <svg width="24" height="2" viewBox="0 0 24 2" fill="none">
              <rect width="24" height="2" rx="1" fill="currentColor" />
            </svg>
          </div>
          Cerrar cotizador
        </button>
      </div>
    </aside>
  );
};