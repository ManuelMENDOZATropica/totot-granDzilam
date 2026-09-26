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
  /** Mensualidad fija pactada. 0 o ausente = se reparte el saldo entre los meses. */
  mensualidadCerrada?: number;
  /** A qué múltiplo se redondea esa mensualidad fija. */
  pasoMensualidad?: number;
}

export interface FinanceCalculationResult {
  totalSeleccionado: number;
  porcentajeEnganche: number;
  meses: number;
  /** Descuento por tramo de enganche, en porcentaje (0, 5, 10 o 15). */
  descuentoPorcentaje: number;
  descuentoAplicado: number;
  totalConDescuento: number;
  enganche: number;
  saldoFinanciar: number;
  mensualidad: number;
  /** Lo que queda pendiente al final si la mensualidad pactada no cubre el saldo. */
  saldoContraEntrega: number;
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

/**
 * Descuento por pagar más de contado. Los tramos son los que ya aplicaba la web desde el
 * principio; vivían solo en el navegador, así que /api/finance/simulate cotizaba sin
 * descuento y devolvía números distintos a los que veía el cliente en pantalla.
 */
export const calcularDescuento = (porcentajeEnganche: number) => {
  if (porcentajeEnganche >= 100) return 0.15;
  if (porcentajeEnganche >= 70) return 0.1;
  if (porcentajeEnganche >= 50) return 0.05;
  return 0;
};

/**
 * Esta función es la definición de cómo se cotiza en Gran Dzilam. El mismo cálculo está
 * replicado en frontend/src/hooks/useCotizacion.ts porque la web lo resuelve en el
 * navegador (sin ida y vuelta al servidor) y los dos despliegues son independientes: el
 * front vive en Vercel con root `frontend/` y no puede importar de `backend/`.
 *
 * Si se toca algo aquí hay que tocarlo allí, y al revés. El test
 * backend/src/utils/finance.test.ts fija los casos que tienen que dar igual en los dos.
 */
export const calculateFinance = ({
  totalSeleccionado,
  porcentajeEnganche,
  meses,
  interes = 0,
  tipoInteres = 'total',
  constraints,
  mensualidadCerrada = 0,
  pasoMensualidad = 1,
}: FinanceCalculationInput): FinanceCalculationResult => {
  const total = Math.max(totalSeleccionado, 0);
  const porcentaje = sanitizePercentage(porcentajeEnganche, constraints);
  const mesesSanitized = sanitizeMonths(meses, constraints);

  if (mesesSanitized < 1) {
    throw new Error('El plazo en meses debe ser mayor o igual a 1.');
  }

  const descuentoPorcentaje = calcularDescuento(porcentaje);
  const totalConDescuento = Math.max(total * (1 - descuentoPorcentaje), 0);
  const descuentoAplicado = Math.max(total - totalConDescuento, 0);

  const enganche = Math.round(totalConDescuento * (porcentaje / 100));
  const saldoFinanciar = Math.max(totalConDescuento - enganche, 0);
  const tasa = Math.max(interes, 0);

  // Se calcula exacto y se redondea al final: si se redondea antes, el residuo de la
  // división se cuela en interesTotal y aparecen intereses con tasa 0.
  const mensualidadExacta =
    mesesSanitized > 0
      ? tipoInteres === 'anual'
        ? mensualidadAmortizada(saldoFinanciar, tasa, mesesSanitized)
        : (saldoFinanciar + (tasa > 0 ? saldoFinanciar * (tasa / 100) : 0)) / mesesSanitized
      : 0;

  const mensualidadBase = Math.round(mensualidadExacta);
  const totalMensualidades = mensualidadExacta * mesesSanitized;

  // Mensualidad pactada: nunca puede subir por encima de la que toca, solo bajarla y
  // dejar el resto contra entrega.
  const paso = Math.max(Math.round(pasoMensualidad || 1), 1);
  const cerrada =
    mensualidadCerrada > 0 ? Math.max(Math.round(mensualidadCerrada / paso) * paso, paso) : null;
  const mensualidad = cerrada !== null ? Math.min(cerrada, mensualidadBase) : mensualidadBase;
  const saldoContraEntrega =
    mensualidad < mensualidadBase
      ? Math.round(Math.max(totalMensualidades - mensualidad * mesesSanitized, 0))
      : 0;

  const interesTotal = Math.round(Math.max(totalMensualidades - saldoFinanciar, 0));

  if (total === 0) {
    return {
      totalSeleccionado: 0,
      porcentajeEnganche: porcentaje,
      meses: mesesSanitized,
      descuentoPorcentaje: 0,
      descuentoAplicado: 0,
      totalConDescuento: 0,
      enganche: 0,
      saldoFinanciar: 0,
      mensualidad: 0,
      saldoContraEntrega: 0,
      interesTotal: 0,
      tipoInteres,
    };
  }

  return {
    totalSeleccionado: total,
    porcentajeEnganche: porcentaje,
    meses: mesesSanitized,
    descuentoPorcentaje: descuentoPorcentaje * 100,
    descuentoAplicado,
    totalConDescuento,
    enganche,
    saldoFinanciar,
    mensualidad,
    saldoContraEntrega,
    interesTotal,
    tipoInteres,
  };
};
