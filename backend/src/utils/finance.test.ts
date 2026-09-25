import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinance } from './finance';

test('calculateFinance returns zeros when total is zero', () => {
  const result = calculateFinance({ totalSeleccionado: 0, porcentajeEnganche: 30, meses: 36 });

  assert.deepStrictEqual(result, {
    totalSeleccionado: 0,
    porcentajeEnganche: 30,
    meses: 36,
    enganche: 0,
    saldoFinanciar: 0,
    mensualidad: 0,
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
