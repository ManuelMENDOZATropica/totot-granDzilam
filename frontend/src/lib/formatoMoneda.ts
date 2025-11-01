const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatearMoneda = (valor: number) => {
  if (!Number.isFinite(valor)) {
    return formatter.format(0);
  }

  return formatter.format(Math.round(valor));
};
