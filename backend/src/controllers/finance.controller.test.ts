import type { Request, Response } from 'express';
import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateFinance } from './finance.controller';
import { lotsMock } from '../data/lots.mock';

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

test('simulateFinance validates unavailable lots', () => {
  const unavailableLot = lotsMock.find((lot) => lot.estado !== 'disponible');
  const req = {
    body: { lotIds: [unavailableLot?.id ?? ''], porcentajeEnganche: 30, meses: 36 },
  } as unknown as Request;
  const res = createResponse();

  simulateFinance(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.data.message, /no están disponibles/);
});

test('simulateFinance calculates finance for available lots', () => {
  const availableLots = lotsMock.filter((lot) => lot.estado === 'disponible').slice(0, 2);
  const req = {
    body: { lotIds: availableLots.map((lot) => lot.id), porcentajeEnganche: 40, meses: 24 },
  } as unknown as Request;
  const res = createResponse();

  simulateFinance(req, res);

  assert.equal(res.statusCode, undefined);
  assert.ok(res.data.totalSeleccionado > 0);
  assert.equal(res.data.enganche, Math.round(res.data.totalSeleccionado * 0.4));
});

test('simulateFinance rejects invalid months value', () => {
  const availableLot = lotsMock.find((lot) => lot.estado === 'disponible');
  const req = {
    body: { lotIds: [availableLot?.id ?? ''], porcentajeEnganche: 30, meses: 0 },
  } as unknown as Request;
  const res = createResponse();

  simulateFinance(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.data.message, /meses/);
});
