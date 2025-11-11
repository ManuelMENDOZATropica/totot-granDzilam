import type { Request, Response } from 'express';
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { simulateFinance } from './finance.controller';
import { lotsMock } from '../data/lots.mock';
import * as lotsService from '../services/lots.service';
import * as settingsService from '../services/settings.service';

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

test('simulateFinance forwards error when lots are unavailable', async () => {
  const unavailableLot = lotsMock.find((lot) => lot.estado !== 'disponible');
  mock.method(lotsService, 'findLotsByIdentifiers', async () => [
    {
      identifier: unavailableLot?.id ?? 'L1',
      superficieM2: unavailableLot?.superficieM2 ?? 100,
      precio: unavailableLot?.precio ?? 1000,
      estado: 'vendido',
      order: 0,
      _id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  mock.method(settingsService, 'getFinanceSettings', async () => ({
    minEnganche: 10,
    maxEnganche: 80,
    defaultEnganche: 30,
    minMeses: 6,
    maxMeses: 60,
    defaultMeses: 36,
    interes: 0,
  }));

  const req = {
    body: { lotIds: [unavailableLot?.id ?? 'L1'], porcentajeEnganche: 30, meses: 36 },
  } as unknown as Request;
  const res = createResponse();
  const next = mock.fn();

  await simulateFinance(req, res, next as unknown as (err?: unknown) => void);

  assert.equal(next.mock.calls.length, 1);
  const error = next.mock.calls[0].arguments[0] as Error;
  assert.match(error.message, /no están disponibles/);

  mock.restoreAll();
});

test('simulateFinance calculates finance for available lots', async () => {
  const availableLots = lotsMock.filter((lot) => lot.estado === 'disponible').slice(0, 2);
  mock.method(lotsService, 'findLotsByIdentifiers', async () =>
    availableLots.map((lot, index) => ({
      identifier: lot.id,
      superficieM2: lot.superficieM2,
      precio: lot.precio,
      estado: lot.estado,
      order: index,
      _id: String(index + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );
  mock.method(settingsService, 'getFinanceSettings', async () => ({
    minEnganche: 10,
    maxEnganche: 80,
    defaultEnganche: 30,
    minMeses: 6,
    maxMeses: 60,
    defaultMeses: 36,
    interes: 0,
  }));

  const req = {
    body: { lotIds: availableLots.map((lot) => lot.id), porcentajeEnganche: 40, meses: 24 },
  } as unknown as Request;
  const res = createResponse();

  await simulateFinance(req, res, () => {
    throw new Error('next should not be called');
  });

  assert.ok(res.data.totalSeleccionado > 0);
  assert.equal(res.data.porcentajeEnganche, 40);
  assert.equal(res.data.meses, 24);
  assert.equal(res.data.enganche, Math.round(res.data.totalSeleccionado * 0.4));

  mock.restoreAll();
});

test('simulateFinance rejects invalid lotIds payload', async () => {
  const req = {
    body: { lotIds: 'invalid' },
  } as unknown as Request;
  const res = createResponse();
  const next = mock.fn();

  await simulateFinance(req, res, next as unknown as (err?: unknown) => void);

  assert.equal(next.mock.calls.length, 1);
  const error = next.mock.calls[0].arguments[0] as Error;
  assert.match(error.message, /arreglo/);
});
