/**
 * Cómo se interpreta el porcentaje de interés.
 *
 * M4 — El cálculo original hacía `saldo * interes/100` una sola vez sobre el saldo
 * completo. Con el campo etiquetado solo «Interés (%)», alguien que escribiera 12
 * pensando «12 % anual» sobre 45 meses cobraba 12 % total: casi cinco veces menos que un
 * préstamo amortizado real. Hoy no se nota porque el producto se vende sin intereses
 * (el brochure promete «12 meses sin intereses») y producción tiene interes: 0.
 *
 * En vez de elegir una interpretación y cambiar las cotizaciones en silencio, el modo es
 * explícito. 'total' preserva exactamente el comportamiento anterior y es el valor por
 * defecto; 'anual' aplica amortización francesa, que es lo que significa «interés» en un
 * crédito.
 */
export type TipoInteres = 'total' | 'anual';

export interface FinanceCalculationInput {
  totalSeleccionado: number;
  porcentajeEnganche: number;
  meses: number;
  interes?: number;
  tipoInteres?: TipoInteres;
  constraints?: FinanceConstraints;
}

export interface FinanceCalculationResult {
  totalSeleccionado: number;
  porcentajeEnganche: number;
  meses: number;
  enganche: number;
  saldoFinanciar: number;
  mensualidad: number;
  /** Suma de todas las mensualidades menos el saldo: lo que cuesta financiar. */
  interesTotal: number;
  tipoInteres: TipoInteres;
}

export interface FinanceConstraints {
  minEnganche: number;
  maxEnganche: number;
  minMeses: number;
  maxMeses: number;
}

/**
 * M5 — Estos límites solo se usan cuando no llegan `constraints`, es decir cuando la base
 * no ha respondido todavía. Antes decían maxMeses: 50, mientras el modelo de Mongo ponía
 * 60 por defecto y producción sirve 45: tres números distintos para lo mismo.
 *
 * Se alinean con los del modelo (backend/src/models/finance-settings.model.ts), que es la
 * fuente de la que sale el registro inicial. Lo que sirva la base manda sobre esto.
 */
const DEFAULT_CONSTRAINTS: FinanceConstraints = {
  minEnganche: 10,
  maxEnganche: 80,
  minMeses: 6,
  maxMeses: 60,
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const sanitizePercentage = (value: number, constraints?: FinanceConstraints) => {
  const limits = constraints ?? DEFAULT_CONSTRAINTS;
  const parsed = Number.isFinite(value) ? Math.round(value) : limits.minEnganche;
  return clamp(parsed, limits.minEnganche, limits.maxEnganche);
};

export const sanitizeMonths = (value: number, constraints?: FinanceConstraints) => {
  const limits = constraints ?? DEFAULT_CONSTRAINTS;
  const parsed = Number.isFinite(value) ? Math.round(value) : limits.minMeses;
  return clamp(parsed, limits.minMeses, limits.maxMeses);
};

/**
 * Mensualidad de un crédito amortizado (sistema francés), con tasa anual nominal.
 *   pago = P · i / (1 − (1 + i)^−n)   con i = tasa anual / 12
 */
const mensualidadAmortizada = (saldo: number, tasaAnual: number, meses: number) => {
  const i = tasaAnual / 100 / 12;
  if (i <= 0) return saldo / meses;
  return (saldo * i) / (1 - Math.pow(1 + i, -meses));
};

export const calculateFinance = ({
  totalSeleccionado,
  porcentajeEnganche,
  meses,
  interes = 0,
  tipoInteres = 'total',
  constraints,
}: FinanceCalculationInput): FinanceCalculationResult => {
  const total = Math.max(totalSeleccionado, 0);
  const porcentaje = sanitizePercentage(porcentajeEnganche, constraints);
  const mesesSanitized = sanitizeMonths(meses, constraints);

  if (mesesSanitized < 1) {
    throw new Error('El plazo en meses debe ser mayor o igual a 1.');
  }

  const enganche = Math.round(total * (porcentaje / 100));
  const saldoFinanciar = Math.max(total - enganche, 0);
  const tasa = Math.max(interes, 0);

  // Se calcula exacto y se redondea al final: si se redondea antes, el residuo de la
  // división se cuela en interesTotal y aparecen intereses con tasa 0.
  const mensualidadExacta =
    mesesSanitized > 0
      ? tipoInteres === 'anual'
        ? mensualidadAmortizada(saldoFinanciar, tasa, mesesSanitized)
        : (saldoFinanciar + (tasa > 0 ? saldoFinanciar * (tasa / 100) : 0)) / mesesSanitized
      : 0;

  const mensualidad = Math.round(mensualidadExacta);
  const interesTotal = Math.round(Math.max(mensualidadExacta * mesesSanitized - saldoFinanciar, 0));

  if (total === 0) {
    return {
      totalSeleccionado: 0,
      porcentajeEnganche: porcentaje,
      meses: mesesSanitized,
      enganche: 0,
      saldoFinanciar: 0,
      mensualidad: 0,
      interesTotal: 0,
      tipoInteres,
    };
  }

  return {
    totalSeleccionado: total,
    porcentajeEnganche: porcentaje,
    meses: mesesSanitized,
    enganche,
    saldoFinanciar,
    mensualidad,
    interesTotal,
    tipoInteres,
  };
};
