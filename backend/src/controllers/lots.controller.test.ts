import type { Request, Response } from 'express';
import test from 'node:test';
import assert from 'node:assert/strict';
import { listLots } from './lots.controller';

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

test('listLots returns paginated lots by default', () => {
  const req = { query: {} } as unknown as Request;
  const res = createResponse();

  listLots(req, res);

  assert.equal(res.data.items.length, 12);
  assert.equal(res.data.page, 1);
  assert.ok(res.data.total > 12);
});

test('listLots filters by status', () => {
  const req = { query: { estatus: 'vendido', pageSize: '50' } } as unknown as Request;
  const res = createResponse();

  listLots(req, res);

  assert.ok(res.data.items.length > 0);
  assert.ok(res.data.items.every((item: { estatus: string }) => item.estatus === 'vendido'));
});

test('listLots applies surface range and search filters', () => {
  const req = {
    query: { superficieMin: '200', superficieMax: '280', q: 'M', pageSize: '60' },
  } as unknown as Request;
  const res = createResponse();

  listLots(req, res);

  assert.ok(res.data.items.length > 0);
  assert.ok(res.data.items.every((item: { superficieM2: number }) => item.superficieM2 >= 200));
  assert.ok(res.data.items.every((item: { superficieM2: number }) => item.superficieM2 <= 280));
});
