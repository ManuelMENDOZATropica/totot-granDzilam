import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import type { ImagineData } from '@/hooks/useImagine';
import { ImagineSection, type ImagineSectionProps } from './ImagineSection';

const baseResult: ImagineData = {
  textoInspirador: 'Un texto cálido para imaginar tu espacio ideal.',
  promptVisual: 'Minimal realistic prompt example.',
  imageUrl: 'https://example.com/image.png',
};

const renderSection = (overrideProps: Partial<ImagineSectionProps>) => {
  const props: ImagineSectionProps = {
    prompt: 'Casa moderna',
    size: '1024x1024',
    status: 'idle',
    result: null,
    imagineError: null,
    onPromptChange: () => {},
    onSizeChange: () => {},
    onSubmit: (event) => event.preventDefault(),
    onShortcut: () => {},
    onRetry: () => {},
    ...overrideProps,
  };

  return renderToString(<ImagineSection {...props} />);
};

test('ImagineSection renders idle state placeholder', () => {
  const html = renderSection({ status: 'idle', result: null, imagineError: null });

  assert.ok(html.includes('Describe tu idea'));
});

test('ImagineSection renders loading state', () => {
  const html = renderSection({ status: 'loading', result: null, imagineError: null });

  assert.ok(html.includes('Generando inspiración…'));
  assert.ok(html.includes('Imaginando…'));
});

test('ImagineSection renders success state', () => {
  const html = renderSection({ status: 'success', result: baseResult, imagineError: null });

  assert.ok(html.includes(baseResult.textoInspirador));
  assert.ok(html.includes('Ver prompt usado'));
  assert.ok(html.includes('Generar otra'));
});

test('ImagineSection renders error state', () => {
  const html = renderSection({ status: 'error', result: null, imagineError: 'Algo salió mal' });

  assert.ok(html.includes('Algo salió mal'));
  assert.ok(html.includes('Generar otra'));
});
