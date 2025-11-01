export const formatCurrency = (value: number, options: Intl.NumberFormatOptions = {}) => {
  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  });

  return formatter.format(value);
};
