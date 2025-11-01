import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinanceTotals, sanitizeMonths, sanitizePercentage, toggleSelectionId } from './useLotsSelection';
import type { Lot } from '@/lib/api';

const lotA: Lot = {
  id: 'L01-01',
  superficieM2: 200,
  precio: 250000,
  estado: 'disponible',
};

const lotB: Lot = {
  id: 'L01-02',
  superficieM2: 210,
  precio: 300000,
  estado: 'disponible',
};

const lots: Lot[] = [lotA, lotB];

test('sanitizePercentage clamps values between 10 and 80', () => {
  assert.equal(sanitizePercentage(5), 10);
  assert.equal(sanitizePercentage(85), 80);
  assert.equal(sanitizePercentage(40), 40);
});

test('sanitizeMonths clamps values between 6 and 60', () => {
  assert.equal(sanitizeMonths(1), 6);
  assert.equal(sanitizeMonths(120), 60);
  assert.equal(sanitizeMonths(24), 24);
});

test('toggleSelectionId toggles ids in the selection array', () => {
  const firstToggle = toggleSelectionId([], lotA.id);
  assert.deepStrictEqual(firstToggle, [lotA.id]);
  const secondToggle = toggleSelectionId(firstToggle, lotA.id);
  assert.deepStrictEqual(secondToggle, []);
});

test('calculateFinanceTotals calculates totals for selected lots', () => {
  const totals = calculateFinanceTotals([lotA.id, lotB.id], lots, 40, 24);
  const expectedTotal = lotA.precio + lotB.precio;
  assert.equal(totals.totalSeleccionado, expectedTotal);
  assert.equal(totals.enganche, Math.round(expectedTotal * 0.4));
  assert.equal(totals.mensualidad, Math.round(totals.saldoFinanciar / 24));
});

test('calculateFinanceTotals returns zeros when nothing selected', () => {
  const totals = calculateFinanceTotals([], lots, 30, 36);
  assert.deepStrictEqual(totals, {
    totalSeleccionado: 0,
    enganche: 0,
    saldoFinanciar: 0,
    mensualidad: 0,
  });
});
