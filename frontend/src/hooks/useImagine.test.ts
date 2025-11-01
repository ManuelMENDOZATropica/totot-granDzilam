import test from 'node:test';
import assert from 'node:assert/strict';
import { imagineSizes, normalizeImaginePrompt } from './useImagine';

test('normalizeImaginePrompt trims and collapses whitespace', () => {
  const normalized = normalizeImaginePrompt('   Casa   moderna   frente  al   mar   ');
  assert.equal(normalized, 'Casa moderna frente al mar');
});

test('imagineSizes exposes supported sizes in descending order', () => {
  assert.deepEqual(imagineSizes, ['1024x1024', '768x768', '512x512']);
});
