import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

process.env.PORT = process.env.PORT ?? '4000';
process.env.MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'test-key';
process.env.USE_MOCK_OPENAI = 'false';

const { createImagineService } = require('./imagine.service') as typeof import('./imagine.service');

test('createImagineService caches results for repeated prompts', async () => {
  const tempResultsDir = path.join(process.cwd(), '__tmp-imagine-results');
  fs.rmSync(tempResultsDir, { recursive: true, force: true });

  let fetchCalls = 0;
  let receivedBody: any = null;

  const sampleBase64Image =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/xcAAwMCAO3ZpfcAAAAASUVORK5CYII=';

  const imageResponse = { data: [{ b64_json: sampleBase64Image }] };

  const fetchImpl: typeof fetch = (async (_url, init) => {
    fetchCalls += 1;
    receivedBody = init?.body ? JSON.parse(init.body as string) : null;
    return {
      ok: true,
      status: 200,
      json: async () => imageResponse,
      text: async () => JSON.stringify(imageResponse),
    } as any;
  }) as typeof fetch;

  let currentTime = Date.now();
  const service = createImagineService({
    fetchImpl,
    now: () => currentTime,
    useMock: false,
    apiKey: 'fake-key',
    cache: new Map(),
    resultsDir: tempResultsDir,
  });

  const payload = { prompt: 'Casa moderna frente a la playa', size: '1024x1024' as const };

  const first = await service.generateImaginedDesign(payload);
  currentTime += 1000;
  const second = await service.generateImaginedDesign(payload);

  assert.equal(fetchCalls, 1);
  assert.deepEqual(first, second);

  const expectedBaseImage = fs.readFileSync(path.join(process.cwd(), 'src', 'IA', '1.png')).toString('base64');
  assert.equal(receivedBody?.response_format, 'b64_json');
  assert.equal(receivedBody?.image, expectedBaseImage);

  const savedFile = first.imageUrl ? path.join(tempResultsDir, path.basename(first.imageUrl)) : '';
  assert.ok(savedFile && fs.existsSync(savedFile));

  fs.rmSync(tempResultsDir, { recursive: true, force: true });
});
