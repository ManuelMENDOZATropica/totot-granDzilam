import type { Request, Response } from 'express';
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { listLots } from './lots.controller';
import * as lotsService from '../services/lots.service';
import { lotsMock } from '../data/lots.mock';

const createResponse = () => {
  const res: Partial<Response> & { data?: any; statusCode?: number } = {};
  res.statusCode = 200;
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

test('listLots normalizes service response into a consistent payload', async () => {
  mock.method(lotsService, 'fetchLots', async () => lotsMock.slice(0, 12));

  const req = { query: {} } as unknown as Request;
  const res = createResponse();

  await listLots(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.data.items));
  assert.equal(res.data.items.length, 12);
  assert.equal(res.data.total, 12);
  assert.equal(res.data.page, 1);
  assert.equal(res.data.pageSize, 12);

  res.data.items.forEach((item: any) => {
    assert.equal(typeof item.id, 'string');
    assert.equal(typeof item.superficieM2, 'number');
    assert.equal(typeof item.precio, 'number');
    assert.ok(['disponible', 'vendido', 'apartado'].includes(item.estado));
  });

  mock.restoreAll();
});

test('listLots returns empty array structure when service yields no lots', async () => {
  mock.method(lotsService, 'fetchLots', async () => []);

  const req = { query: {} } as unknown as Request;
  const res = createResponse();

  await listLots(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.data.items));
  assert.equal(res.data.items.length, 0);
  assert.equal(res.data.total, 0);
  assert.equal(res.data.page, 1);
  assert.equal(res.data.pageSize, 0);

  mock.restoreAll();
});

test('listLots responds with 500 when service throws an error', async () => {
  mock.method(lotsService, 'fetchLots', async () => {
    throw new Error('db offline');
  });

  const req = { query: {} } as unknown as Request;
  const res = createResponse();

  await listLots(req, res);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.data, { message: 'No se pudo obtener la lista de lotes' });

  mock.restoreAll();
});
