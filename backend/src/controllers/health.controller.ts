import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * R3 — Antes devolvía siempre {status:'ok'} sin mirar nada. Como connectDatabase()
 * atrapa el fallo de Mongo y deja arrancar igual, el endpoint respondía 200 con la base
 * caída y el badge del frontend se pintaba verde. Render tampoco podía reiniciar el
 * servicio, porque para él estaba sano.
 */
const ESTADOS: Record<number, string> = {
  0: 'desconectado',
  1: 'conectado',
  2: 'conectando',
  3: 'desconectando',
  99: 'sin inicializar',
};

export const getHealth = (_req: Request, res: Response) => {
  const estado = mongoose.connection.readyState;
  const conectado = estado === 1;

  res.status(conectado ? 200 : 503).json({
    status: conectado ? 'ok' : 'degraded',
    database: ESTADOS[estado] ?? 'desconocido',
    timestamp: new Date().toISOString(),
  });
};
