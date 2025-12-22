import test from 'node:test';
import assert from 'node:assert/strict';
import { getImagineImageSrc, imagineSizes, normalizeImaginePrompt } from './useImagine';

test('normalizeImaginePrompt trims and collapses whitespace', () => {
  const normalized = normalizeImaginePrompt('   Casa   moderna   frente  al   mar   ');
  assert.equal(normalized, 'Casa moderna frente al mar');
});

test('imagineSizes exposes supported sizes in descending order', () => {
  assert.deepEqual(imagineSizes, ['1024x1024', '1024x1536', '1536x1024', 'auto']);
});

test('getImagineImageSrc prefers base64 over url', () => {
  const src = getImagineImageSrc({
    imageUrl: '/IA/resultados/sample.png',
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB',
  });
  assert.ok(src?.startsWith('data:image/png;base64,'));
});
