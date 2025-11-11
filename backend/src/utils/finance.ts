export interface FinanceCalculationInput {
  totalSeleccionado: number;
  porcentajeEnganche: number;
  meses: number;
  interes?: number;
  constraints?: FinanceConstraints;
}

export interface FinanceCalculationResult {
  totalSeleccionado: number;
  porcentajeEnganche: number;
  meses: number;
  enganche: number;
  saldoFinanciar: number;
  mensualidad: number;
}

export interface FinanceConstraints {
  minEnganche: number;
  maxEnganche: number;
  minMeses: number;
  maxMeses: number;
}

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

export const calculateFinance = ({
  totalSeleccionado,
  porcentajeEnganche,
  meses,
  interes = 0,
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
