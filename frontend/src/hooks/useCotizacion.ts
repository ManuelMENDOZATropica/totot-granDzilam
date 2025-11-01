import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerLotes, type LoteDTO } from '@/lib/api';

export type Lote = LoteDTO;

export interface TotalesCotizacion {
  totalSeleccionado: number;
  enganche: number;
  saldoFinanciar: number;
  mensualidad: number;
}

interface ParametrosCotizacionStorage {
  porcentaje: number;
  meses: number;
}

const SELECCION_STORAGE_KEY = 'gran-dzilam:seleccion';
const PARAMETROS_STORAGE_KEY = 'gran-dzilam:parametros';
const MIN_ENGANCHE = 10;
const MAX_ENGANCHE = 80;
const MIN_MESES = 6;
const MAX_MESES = 60;
const DEFAULT_ENGANCHE = 30;
const DEFAULT_MESES = 36;

const sanitizePercentage = (valor: number) => {
  if (!Number.isFinite(valor)) {
    return DEFAULT_ENGANCHE;
  }

  return Math.min(Math.max(Math.round(valor), MIN_ENGANCHE), MAX_ENGANCHE);
};

const sanitizeMonths = (valor: number) => {
  if (!Number.isFinite(valor)) {
    return DEFAULT_MESES;
  }

  return Math.min(Math.max(Math.round(valor), MIN_MESES), MAX_MESES);
};

const leerLocalStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored) as T;
  } catch (error) {
    console.warn(`No se pudo leer ${key} de localStorage`, error);
    return fallback;
  }
};

const escribirLocalStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`No se pudo guardar ${key} en localStorage`, error);
  }
};

const leerParametrosIniciales = () =>
  leerLocalStorage<ParametrosCotizacionStorage>(PARAMETROS_STORAGE_KEY, {
    porcentaje: DEFAULT_ENGANCHE,
    meses: DEFAULT_MESES,
  });

const calcularTotales = (lotes: Lote[], porcentaje: number, meses: number): TotalesCotizacion => {
  if (!lotes.length) {
    return {
      totalSeleccionado: 0,
      enganche: 0,
      saldoFinanciar: 0,
      mensualidad: 0,
    };
  }

  const totalSeleccionado = lotes.reduce((acum, lote) => acum + lote.precio, 0);
  const enganche = Math.round(totalSeleccionado * (porcentaje / 100));
  const saldoFinanciar = Math.max(totalSeleccionado - enganche, 0);
  const mensualidad = meses > 0 ? Math.round(saldoFinanciar / meses) : 0;

  return { totalSeleccionado, enganche, saldoFinanciar, mensualidad };
};

export const useCotizacion = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => leerLocalStorage(SELECCION_STORAGE_KEY, []));
  const [porcentajeEnganche, setPorcentajeEnganche] = useState(() =>
    sanitizePercentage(leerParametrosIniciales().porcentaje),
  );
  const [meses, setMeses] = useState(() => sanitizeMonths(leerParametrosIniciales().meses));

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const cargarLotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerLotes(controller.signal);
        if (!cancelled) {
          setLotes(data);
        }
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        console.error(err);
        setError('Hubo un problema al obtener los lotes. Intenta nuevamente más tarde.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void cargarLotes();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    escribirLocalStorage(SELECCION_STORAGE_KEY, selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    escribirLocalStorage(PARAMETROS_STORAGE_KEY, {
      porcentaje: porcentajeEnganche,
      meses,
    });
  }, [porcentajeEnganche, meses]);

  const selectedLots = useMemo(() => {
    if (!selectedIds.length) return [] as Lote[];
    return selectedIds
      .map((id) => lotes.find((lote) => lote.id === id))
      .filter((lote): lote is Lote => Boolean(lote));
  }, [lotes, selectedIds]);

  const totales = useMemo(() => calcularTotales(selectedLots, porcentajeEnganche, meses), [
    selectedLots,
    porcentajeEnganche,
    meses,
  ]);

  const toggleLote = useCallback(
    (loteId: string) => {
      const lote = lotes.find((item) => item.id === loteId);
      if (!lote || lote.estado !== 'disponible') {
        return;
      }

      setSelectedIds((prev) => {
        if (prev.includes(loteId)) {
          return prev.filter((id) => id !== loteId);
        }
        return [...prev, loteId];
      });
    },
    [lotes],
  );

  const limpiarSeleccion = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const actualizarPorcentaje = useCallback((valor: number) => {
    setPorcentajeEnganche(sanitizePercentage(valor));
  }, []);

  const actualizarMeses = useCallback((valor: number) => {
    setMeses(sanitizeMonths(valor));
  }, []);

  return {
    lotes,
    loading,
    error,
    selectedIds,
    selectedLots,
    porcentajeEnganche,
    meses,
    totales,
    toggleLote,
    limpiarSeleccion,
    actualizarPorcentaje,
    actualizarMeses,
  };
};
