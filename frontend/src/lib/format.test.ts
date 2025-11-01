import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency } from './format';

test('formatCurrency formats numbers as MXN currency', () => {
  assert.equal(formatCurrency(123456), '$123,456');
});

test('formatCurrency respects custom fraction digits', () => {
  assert.equal(formatCurrency(1234.56, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), '$1,234.56');
});
