export interface FinanceCalculationInput {
  totalSeleccionado: number;
  porcentajeEnganche: number;
  meses: number;
  interes?: number;
}

export interface FinanceCalculationResult {
  totalSeleccionado: number;
  porcentajeEnganche: number;
  meses: number;
  enganche: number;
  saldoFinanciar: number;
  mensualidad: number;
}

const MIN_ENGANCHE = 10;
const MAX_ENGANCHE = 80;
const MIN_MONTHS = 6;
const MAX_MONTHS = 60;

export const sanitizePercentage = (value: number) => {
  if (Number.isNaN(value)) {
    return MIN_ENGANCHE;
  }

  return Math.min(Math.max(Math.round(value), MIN_ENGANCHE), MAX_ENGANCHE);
};

export const sanitizeMonths = (value: number) => {
  if (!Number.isFinite(value)) {
    return MIN_MONTHS;
  }

  return Math.min(Math.max(Math.round(value), MIN_MONTHS), MAX_MONTHS);
};

export const calculateFinance = ({
  totalSeleccionado,
  porcentajeEnganche,
  meses,
  interes = 0,
}: FinanceCalculationInput): FinanceCalculationResult => {
  const total = Math.max(totalSeleccionado, 0);
  const porcentaje = sanitizePercentage(porcentajeEnganche);
  const mesesSanitized = sanitizeMonths(meses);

  if (mesesSanitized < 1) {
    throw new Error('El plazo en meses debe ser mayor o igual a 1.');
  }

  const enganche = Math.round(total * (porcentaje / 100));
  const saldoFinanciar = Math.max(total - enganche, 0);
  const interesTotal = Math.max(interes, 0) > 0 ? saldoFinanciar * (interes / 100) : 0;
  const montoConInteres = saldoFinanciar + interesTotal;
  const mensualidad = mesesSanitized > 0 ? Math.round(montoConInteres / mesesSanitized) : 0;

  if (total === 0) {
    return {
      totalSeleccionado: 0,
      porcentajeEnganche: porcentaje,
      meses: mesesSanitized,
      enganche: 0,
      saldoFinanciar: 0,
      mensualidad: 0,
    };
  }

  return {
    totalSeleccionado: total,
    porcentajeEnganche: porcentaje,
    meses: mesesSanitized,
    enganche,
    saldoFinanciar,
    mensualidad,
  };
};
