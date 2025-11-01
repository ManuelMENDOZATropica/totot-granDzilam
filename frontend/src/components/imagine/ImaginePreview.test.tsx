import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ImaginePreview } from './ImaginePreview';

const baseResult = {
  textoInspirador: 'Un texto cálido para imaginar tu espacio ideal.',
  promptVisual: 'Minimal realistic prompt example.',
  imageUrl: 'https://example.com/image.png',
};

test('ImaginePreview shows placeholder when idle', () => {
  const html = renderToString(
    <ImaginePreview status="idle" result={null} error={null} onRetry={() => {}} />,
  );

  assert.ok(html.includes('Describe tu idea'));
});

test('ImaginePreview shows loading state', () => {
  const html = renderToString(
    <ImaginePreview status="loading" result={null} error={null} onRetry={() => {}} />,
  );

  assert.ok(html.includes('Generando inspiración…'));
});

test('ImaginePreview renders success state with content', () => {
  const html = renderToString(
    <ImaginePreview status="success" result={baseResult} error={null} onRetry={() => {}} />,
  );

  assert.ok(html.includes(baseResult.textoInspirador));
  assert.ok(html.includes('Ver prompt usado'));
});

test('ImaginePreview renders error message', () => {
  const html = renderToString(
    <ImaginePreview status="error" result={null} error="No se pudo" onRetry={() => {}} />,
  );

  assert.ok(html.includes('No se pudo'));
  assert.ok(html.includes('Generar otra'));
});
