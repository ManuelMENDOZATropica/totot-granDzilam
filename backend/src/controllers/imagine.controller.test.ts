import type { Request, Response } from 'express';
import test from 'node:test';
import assert from 'node:assert/strict';
import type { ImagineServiceErrorCode } from '../services/imagine.service';

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
  assert.deepEqual(res.data, {
    ok: false,
    error: 'INVALID_INPUT',
    message: 'El prompt debe tener entre 5 y 400 caracteres.',
  });
});

test('imagineDesign returns generated content when service succeeds', async (t) => {
  const fakeResult = {
    textoInspirador: 'Un texto cálido y breve.',
    promptVisual: 'A minimal realistic render in English.',
    imageUrl: 'https://example.com/image.png',
  };

  const stub = t.mock.method(imagineService, 'generateImaginedDesign', async () => fakeResult);

  const req = {
    body: { prompt: '   Casa moderna   frente al mar  ', size: '1024X1536 ' },
  } as unknown as Request;
  const res = createResponse();

  await imagineDesign(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.data, { ok: true, data: fakeResult });
  assert.equal(stub.mock.calls.length, 1);
  const firstCall = stub.mock.calls[0];
  assert.ok(firstCall?.arguments?.[0]);
  assert.equal(firstCall.arguments[0].prompt, 'Casa moderna frente al mar');
  assert.equal(firstCall.arguments[0].size, '1024x1536');
});

const createServiceError = (message: string, status: number, errorCode: ImagineServiceErrorCode) =>
  Object.assign(new Error(message), { status, errorCode });

test('imagineDesign maps OpenAI 400 errors to INVALID_PROMPT_OR_FORMAT', async (t) => {
  t.mock.method(imagineService, 'generateImaginedDesign', async () => {
    throw createServiceError('invalid_request_error: missing json', 400, 'INVALID_PROMPT_OR_FORMAT');
  });

  const req = { body: { prompt: 'Residencia con vistas al mar' } } as unknown as Request;
  const res = createResponse();

  await imagineDesign(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.data, {
    ok: false,
    error: 'INVALID_PROMPT_OR_FORMAT',
    message: 'invalid_request_error: missing json',
  });
});

test('imagineDesign maps quota errors to OPENAI_QUOTA', async (t) => {
  t.mock.method(imagineService, 'generateImaginedDesign', async () => {
    throw createServiceError('quota exceeded', 429, 'OPENAI_QUOTA');
  });

  const req = { body: { prompt: 'Villa ecológica con jardines' } } as unknown as Request;
  const res = createResponse();

  await imagineDesign(req, res);

  assert.equal(res.statusCode, 429);
  assert.deepEqual(res.data, { ok: false, error: 'OPENAI_QUOTA', message: 'quota exceeded' });
});

test('imagineDesign maps timeout errors to OPENAI_UPSTREAM', async (t) => {
  t.mock.method(imagineService, 'generateImaginedDesign', async () => {
    throw createServiceError('Request timed out', 504, 'OPENAI_UPSTREAM');
  });

  const req = { body: { prompt: 'Loft bohemio en el centro histórico' } } as unknown as Request;
  const res = createResponse();

  await imagineDesign(req, res);

  assert.equal(res.statusCode, 504);
  assert.deepEqual(res.data, { ok: false, error: 'OPENAI_UPSTREAM', message: 'Request timed out' });
});
