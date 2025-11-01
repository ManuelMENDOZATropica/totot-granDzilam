import type { Request, Response } from 'express';
import test from 'node:test';
import assert from 'node:assert/strict';

process.env.PORT = process.env.PORT ?? '4000';
process.env.MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'test-key';
process.env.USE_MOCK_OPENAI = 'false';

const { imagineDesign } = require('./imagine.controller') as typeof import('./imagine.controller');
const { imagineService } = require('../services/imagine.service') as typeof import('../services/imagine.service');

const createResponse = () => {
  const res: Partial<Response> & { data?: any; statusCode?: number } = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res as Response;
  };
  res.json = (payload: any) => {
    res.data = payload;
    return res as Response;
  };
  return res as Response & { data?: any; statusCode?: number };
};

test('imagineDesign rejects invalid prompt input', async () => {
  const req = { body: { prompt: 'hola' } } as unknown as Request;
  const res = createResponse();

  await imagineDesign(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.data, { ok: false, error: 'INVALID_INPUT' });
});

test('imagineDesign returns generated content when service succeeds', async (t) => {
  const fakeResult = {
    textoInspirador: 'Un texto cálido y breve.',
    promptVisual: 'A minimal realistic render in English.',
    imageUrl: 'https://example.com/image.png',
  };

  const stub = t.mock.method(imagineService, 'generateImaginedDesign', async () => fakeResult);

  const req = {
    body: { prompt: '   Casa moderna   frente al mar  ', size: '768x768' },
  } as unknown as Request;
  const res = createResponse();

  await imagineDesign(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.data, { ok: true, data: fakeResult });
  assert.equal(stub.mock.calls.length, 1);
  const firstCall = stub.mock.calls[0];
  assert.ok(firstCall?.arguments?.[0]);
  assert.equal(firstCall.arguments[0].prompt, 'Casa moderna frente al mar');
  assert.equal(firstCall.arguments[0].size, '768x768');
});

test('imagineDesign returns 502 when the service throws', async (t) => {
  t.mock.method(imagineService, 'generateImaginedDesign', async () => {
    throw new Error('openai error');
  });

  const req = {
    body: { prompt: 'Cabaña minimalista rodeada de selva' },
  } as unknown as Request;
  const res = createResponse();

  await imagineDesign(req, res);

  assert.equal(res.statusCode, 502);
  assert.deepEqual(res.data, { ok: false, error: 'IMAGE_GENERATION_FAILED' });
});
