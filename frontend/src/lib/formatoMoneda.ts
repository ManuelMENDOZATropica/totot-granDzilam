type Divisa = 'MXN' | 'USD';

const formatters = new Map<Divisa, Intl.NumberFormat>();

const obtenerFormatter = (currency: Divisa) => {
  if (!formatters.has(currency)) {
    formatters.set(
      currency,
      new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    );
  }

  return formatters.get(currency)!;
};

export const formatearMoneda = (valor: number, currency: Divisa = 'MXN') => {
  if (!Number.isFinite(valor)) {
    return obtenerFormatter(currency).format(0);
  }

  return obtenerFormatter(currency).format(Math.round(valor));
};
