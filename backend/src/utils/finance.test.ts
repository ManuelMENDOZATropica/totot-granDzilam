import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinance } from './finance';

test('calculateFinance returns zeros when total is zero', () => {
  const result = calculateFinance({ totalSeleccionado: 0, porcentajeEnganche: 30, meses: 36 });

  assert.deepStrictEqual(result, {
    totalSeleccionado: 0,
    porcentajeEnganche: 30,
    meses: 36,
    descuentoPorcentaje: 0,
    descuentoAplicado: 0,
    totalConDescuento: 0,
    enganche: 0,
    saldoFinanciar: 0,
    mensualidad: 0,
    saldoContraEntrega: 0,
    interesTotal: 0,
    tipoInteres: 'total',
  });
});

test('calculateFinance clamps porcentaje and months into expected range', () => {
  const result = calculateFinance({ totalSeleccionado: 1000000, porcentajeEnganche: 5, meses: 120 });

  assert.equal(result.porcentajeEnganche, 10);
  // M5: los límites por defecto se alinearon con los del modelo de Mongo (60), que antes
  // decían 50 aquí, 60 en el modelo y 45 en producción.
  assert.equal(result.meses, 60);
});

test('calculateFinance calculates finance values correctly', () => {
  const result = calculateFinance({ totalSeleccionado: 500000, porcentajeEnganche: 30, meses: 24 });

  assert.equal(result.enganche, 150000);
  assert.equal(result.saldoFinanciar, 350000);
  assert.equal(result.mensualidad, Math.round(350000 / 24));
});

test('M4: con interés 0 ambos modos dan lo mismo', () => {
  const base = { totalSeleccionado: 1000000, porcentajeEnganche: 30, meses: 45 };
  const total = calculateFinance({ ...base, interes: 0, tipoInteres: 'total' });
  const anual = calculateFinance({ ...base, interes: 0, tipoInteres: 'anual' });

  assert.equal(total.mensualidad, anual.mensualidad);
  assert.equal(total.interesTotal, 0);
});

test('M4: 12% anual amortizado cuesta mucho más que 12% de recargo total', () => {
  const base = { totalSeleccionado: 1000000, porcentajeEnganche: 30, meses: 45, interes: 12 };
  const recargo = calculateFinance({ ...base, tipoInteres: 'total' });
  const amortizado = calculateFinance({ ...base, tipoInteres: 'anual' });

  // El saldo a financiar es el mismo; lo que cambia es cómo se cobra el interés.
  assert.equal(recargo.saldoFinanciar, 700000);
  assert.equal(amortizado.saldoFinanciar, 700000);

  // 12% de recargo único sobre 700,000 son 84,000 en total.
  assert.equal(recargo.interesTotal, 84000);

  // Amortizado al 12% anual sobre 45 meses cuesta bastante más.
  assert.ok(
    amortizado.interesTotal > recargo.interesTotal * 1.8,
    `amortizado ${amortizado.interesTotal} deberia superar con claridad a ${recargo.interesTotal}`,
  );
});

test('M4: el modo por defecto conserva el comportamiento histórico', () => {
  const sinModo = calculateFinance({ totalSeleccionado: 500000, porcentajeEnganche: 20, meses: 24, interes: 10 });
  assert.equal(sinModo.tipoInteres, 'total');
  // saldo 400,000 + 10% = 440,000 repartido en 24
  assert.equal(sinModo.mensualidad, Math.round(440000 / 24));
});


/**
 * Estos casos son el contrato entre este archivo y su gemelo del navegador
 * (frontend/src/hooks/useCotizacion.ts). Los números están escritos a mano, no sacados
 * de la implementación: si alguien cambia uno de los dos lados, esto avisa.
 */
test('el descuento por tramo de enganche se aplica antes que nada', () => {
  const casos: Array<[number, number]> = [
    [30, 0],
    [49, 0],
    [50, 5],
    [69, 5],
    [70, 10],
    [99, 10],
    [100, 15],
  ];

  for (const [porcentaje, esperado] of casos) {
    const r = calculateFinance({
      totalSeleccionado: 1000000,
      porcentajeEnganche: porcentaje,
      meses: 12,
      constraints: { minEnganche: 0, maxEnganche: 100, minMeses: 1, maxMeses: 60 },
    });
    assert.equal(r.descuentoPorcentaje, esperado, `enganche ${porcentaje}%`);
  }
});

test('el enganche se calcula sobre el total YA con descuento', () => {
  const r = calculateFinance({
    totalSeleccionado: 708750,
    porcentajeEnganche: 70,
    meses: 12,
    constraints: { minEnganche: 0, maxEnganche: 100, minMeses: 1, maxMeses: 60 },
  });

  assert.equal(r.totalConDescuento, 637875); // 708,750 − 10 %
  assert.equal(r.enganche, 446513); // 70 % de 637,875, redondeado
  assert.equal(r.saldoFinanciar, 191362);
  assert.equal(r.mensualidad, Math.round(191362 / 12));
});

test('la mensualidad cerrada baja el pago y deja el resto contra entrega', () => {
  const r = calculateFinance({
    totalSeleccionado: 12809880,
    porcentajeEnganche: 30,
    meses: 24,
    mensualidadCerrada: 100000,
    pasoMensualidad: 100000,
    constraints: { minEnganche: 20, maxEnganche: 80, minMeses: 3, maxMeses: 45 },
  });

  assert.equal(r.enganche, 3842964);
  assert.equal(r.saldoFinanciar, 8966916);
  assert.equal(r.mensualidad, 100000);
  assert.equal(r.saldoContraEntrega, 8966916 - 100000 * 24);
});

test('una mensualidad cerrada mayor que la que toca no sube el pago', () => {
  const r = calculateFinance({
    totalSeleccionado: 100000,
    porcentajeEnganche: 30,
    meses: 12,
    mensualidadCerrada: 500000,
    pasoMensualidad: 1000,
    constraints: { minEnganche: 10, maxEnganche: 80, minMeses: 1, maxMeses: 60 },
  });

  assert.equal(r.mensualidad, Math.round(70000 / 12));
  assert.equal(r.saldoContraEntrega, 0);
});

test('los límites que llegan de la configuración se respetan tal cual', () => {
  const constraints = { minEnganche: 20, maxEnganche: 80, minMeses: 3, maxMeses: 45 };

  const bajo = calculateFinance({
    totalSeleccionado: 1000000,
    porcentajeEnganche: 5,
    meses: 1,
    constraints,
  });
  assert.equal(bajo.porcentajeEnganche, 20);
  assert.equal(bajo.meses, 3);

  const alto = calculateFinance({
    totalSeleccionado: 1000000,
    porcentajeEnganche: 100,
    meses: 120,
    constraints,
  });
  assert.equal(alto.porcentajeEnganche, 80);
  assert.equal(alto.meses, 45);
  // Y como no llega al 100 %, el tramo del 15 % queda fuera de alcance.
  assert.equal(alto.descuentoPorcentaje, 10);
});
