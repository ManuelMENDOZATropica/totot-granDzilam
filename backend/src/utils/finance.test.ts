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
  });
});

test('calculateFinance clamps porcentaje and months into expected range', () => {
  const result = calculateFinance({ totalSeleccionado: 1000000, porcentajeEnganche: 5, meses: 120 });

  assert.equal(result.porcentajeEnganche, 10);
  assert.equal(result.meses, 60);
});

test('calculateFinance calculates finance values correctly', () => {
  const result = calculateFinance({ totalSeleccionado: 500000, porcentajeEnganche: 30, meses: 24 });

  assert.equal(result.enganche, 150000);
  assert.equal(result.saldoFinanciar, 350000);
  assert.equal(result.mensualidad, Math.round(350000 / 24));
});
