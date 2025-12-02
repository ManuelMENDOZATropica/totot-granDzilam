import React, { useState } from 'react';
import type { Lote, TotalesCotizacion } from '@/hooks/useCotizacion';
import type { FinanceSettingsDTO } from '@/lib/financeSettings';
import { formatearMoneda } from '@/lib/formatoMoneda';
import ContactForm from '@/components/common/ContactForm';

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
}

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
  onCerrar
}: PanelCotizacionProps) => {
  const [mostrarContacto, setMostrarContacto] = useState(false);
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
      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-y-auto px-8 py-10 lg:px-12">
        
        {/* --- Título --- */}
        <h2 className="mb-10 font-serif text-3xl font-medium text-[#1C2533]">
          Genera tu estimación
        </h2>

        {/* --- Medidas --- */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm font-bold text-[#1C2533]">Medidas</span>
            <span
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-[#1C2533]"
              style={{ backgroundColor: colors.badge }}
            >
              m²
              <svg width="8" height="6" viewBox="0 0 10 6" fill="none">
                <path
                  d="M1 1L5 5L9 1"
                  stroke="#1C2533"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <div className="space-y-2 text-sm text-[#1C2533]">
            {lotesSeleccionados.map((lote, index) => (
              <div key={lote.id || index} className="flex justify-between">
                <span>{lote.nombre || `Lote ${index + 1}`}</span>
                <span>
                  {lote.superficieM2.toLocaleString('es-MX', {
                    minimumFractionDigits: 2
                  })}{' '}
                  m²
                </span>
              </div>
            ))}

            <div className="flex justify-between pt-2 font-bold">
              <span>TOTAL</span>
              <span>
                {totalMetros.toLocaleString('es-MX', {
                  minimumFractionDigits: 2
                })}{' '}
                m²
              </span>
            </div>
          </div>
        </div>

        {/* --- Estimación de costo --- */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm font-bold text-[#1C2533]">
              Estimación de costo
            </span>
            <span
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-[#1C2533]"
              style={{ backgroundColor: colors.badge }}
            >
              mxn
              <svg width="8" height="6" viewBox="0 0 10 6" fill="none">
                <path
                  d="M1 1L5 5L9 1"
                  stroke="#1C2533"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <div className="space-y-3 text-sm text-[#1C2533]">
            {lotesSeleccionados.map((lote, index) => (
              <div key={lote.id || index} className="flex justify-between">
                <span>{lote.nombre || `Lote ${index + 1}`}</span>
                <span>{formatearMoneda(lote.precioTotal || 0)} mxn</span>
              </div>
            ))}

            <div className="flex justify-between pb-4 font-bold">
              <span>TOTAL</span>
              <span>{formatearMoneda(totales.totalSeleccionado)} mxn</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Enganche</span>
                <span>{formatearMoneda(totales.enganche)} mxn</span>
              </div>
              <div className="flex justify-between">
                <span>Saldo</span>
                <span>{formatearMoneda(totales.saldoFinanciar)} mxn</span>
              </div>
              <div className="flex justify-between">
                <span>Mensualidad</span>
                <span>{formatearMoneda(totales.mensualidad)} mxn</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Personaliza tu cotización --- */}
        <div className="mb-10">
          <h3 className="mb-6 text-sm font-bold text-[#1C2533]">
            Personaliza tu cotización
          </h3>

          <div className="flex flex-col gap-8">
            {/* Enganche */}
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
              <div className="text-right text-sm font-semibold text-[#1C2533]">
                {porcentajeEnganche}%
              </div>
            </div>

            {/* Plazo */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs uppercase tracking-wider text-[#64748B]">
                <span>Plazo</span>
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
              <div className="text-right text-sm font-semibold text-[#1C2533]">
                {meses} meses
              </div>
            </div>
          </div>
        </div>

        {/* --- Botones principales --- */}
        <div className="mb-12 flex gap-4">
          <button
            type="button"
            className="flex-1 rounded-full bg-[#1C2533] px-4 py-3 text-sm font-medium text-white hover:bg-[#2d3b50]"
          >
            Descargar cotización
          </button>
          <button
            type="button"
            className="flex-1 rounded-full border border-[#1C2533] px-4 py-3 text-sm font-medium text-[#1C2533] hover:bg-[#1C2533] hover:text-white"
            onClick={() => setMostrarContacto((valorActual) => !valorActual)}
          >
            Contáctanos
          </button>
        </div>

        {mostrarContacto && (
          <div className="mb-12">
            <ContactForm />
          </div>
        )}
      </div>

      {/* FOOTER FIJO */}
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
