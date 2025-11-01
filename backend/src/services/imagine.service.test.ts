import test from 'node:test';
import assert from 'node:assert/strict';

process.env.PORT = process.env.PORT ?? '4000';
process.env.MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'test-key';
process.env.USE_MOCK_OPENAI = 'false';

const { createImagineService } = require('./imagine.service') as typeof import('./imagine.service');

test('createImagineService caches results for repeated prompts', async () => {
  let fetchCalls = 0;

  const chatResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            textoInspirador: 'Texto de prueba cálido y breve.',
            promptVisual: 'Minimal realistic prompt in English with lighting.',
          }),
        },
      },
    ],
  };

  const imageResponse = { data: [{ url: 'https://example.com/generated.png' }] };

  const fetchImpl: typeof fetch = (async (url: string | URL) => {
    fetchCalls += 1;
    const isChat = `${url}`.includes('/chat/completions');
    const payload = isChat ? chatResponse : imageResponse;
    return {
      ok: true,
      status: 200,
      json: async () => payload,
      text: async () => JSON.stringify(payload),
    } as any;
  }) as typeof fetch;

  let currentTime = Date.now();
  const service = createImagineService({
    fetchImpl,
    now: () => currentTime,
    useMock: false,
    apiKey: 'fake-key',
    cache: new Map(),
  });

  const payload = { prompt: 'Casa moderna frente a la playa', size: '1024x1024' as const };

  const first = await service.generateImaginedDesign(payload);
  currentTime += 1000;
  const second = await service.generateImaginedDesign(payload);

  assert.equal(fetchCalls, 2);
  assert.deepEqual(first, second);
});
