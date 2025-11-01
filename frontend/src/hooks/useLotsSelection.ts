import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Lot } from '@/lib/api';

const STORAGE_KEY = 'gd:calc:v1';
const MIN_ENGANCHE = 10;
const MAX_ENGANCHE = 80;
const MIN_MONTHS = 6;
const MAX_MONTHS = 60;

export interface LotsSelectionState {
  selectedIds: string[];
  porcentajeEnganche: number;
  meses: number;
}

export interface FinanceTotals {
  totalSeleccionado: number;
  enganche: number;
  saldoFinanciar: number;
  mensualidad: number;
}

export const sanitizePercentage = (value: number) => {
  if (!Number.isFinite(value)) return MIN_ENGANCHE;
  return Math.min(Math.max(Math.round(value), MIN_ENGANCHE), MAX_ENGANCHE);
};

export const sanitizeMonths = (value: number) => {
  if (!Number.isFinite(value)) return MIN_MONTHS;
  return Math.min(Math.max(Math.round(value), MIN_MONTHS), MAX_MONTHS);
};

export const toggleSelectionId = (current: string[], lotId: string) => {
  const exists = current.includes(lotId);
  return exists ? current.filter((id) => id !== lotId) : [...current, lotId];
};

export const calculateFinanceTotals = (
  selectedIds: string[],
  lots: Lot[],
  porcentajeEnganche: number,
  meses: number,
): FinanceTotals => {
  if (!selectedIds.length) {
    return {
      totalSeleccionado: 0,
      enganche: 0,
      saldoFinanciar: 0,
      mensualidad: 0,
    };
  }

  const sanitizedPorcentaje = sanitizePercentage(porcentajeEnganche);
  const sanitizedMeses = sanitizeMonths(meses);
  const selectedLots = lots.filter((lot) => selectedIds.includes(lot.id));
  const totalSeleccionado = selectedLots.reduce((acc, lot) => acc + lot.precio, 0);

  if (totalSeleccionado <= 0) {
    return {
      totalSeleccionado: 0,
      enganche: 0,
      saldoFinanciar: 0,
      mensualidad: 0,
    };
  }

  const enganche = Math.round(totalSeleccionado * (sanitizedPorcentaje / 100));
  const saldoFinanciar = Math.max(totalSeleccionado - enganche, 0);
  const mensualidad = sanitizedMeses > 0 ? Math.round(saldoFinanciar / sanitizedMeses) : 0;

  return {
    totalSeleccionado,
    enganche,
    saldoFinanciar,
    mensualidad,
  };
};

const loadState = (): LotsSelectionState | null => {
  if (typeof window === 'undefined') return null;

  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data) as Partial<LotsSelectionState>;
    return {
      selectedIds: Array.isArray(parsed.selectedIds) ? parsed.selectedIds : [],
      porcentajeEnganche: sanitizePercentage(parsed.porcentajeEnganche ?? 30),
      meses: sanitizeMonths(parsed.meses ?? 36),
    };
  } catch (error) {
    console.warn('No se pudo restaurar el estado de financiamiento', error);
    return null;
  }
};

const persistState = (state: LotsSelectionState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const useLotsSelection = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [porcentajeEnganche, setPorcentajeEnganche] = useState(30);
  const [meses, setMeses] = useState(36);

  useEffect(() => {
    const restored = loadState();
    if (restored) {
      setSelectedIds(restored.selectedIds);
      setPorcentajeEnganche(restored.porcentajeEnganche);
      setMeses(restored.meses);
    }
  }, []);

  useEffect(() => {
    persistState({ selectedIds, porcentajeEnganche, meses });
  }, [selectedIds, porcentajeEnganche, meses]);

  const toggleLot = useCallback((lotId: string) => {
    setSelectedIds((prev) => {
      const next = toggleSelectionId(prev, lotId);
      console.info('Selección de lotes actualizada', next);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const updatePorcentaje = useCallback((value: number) => {
    const sanitized = sanitizePercentage(value);
    console.info('Porcentaje de enganche actualizado', sanitized);
    setPorcentajeEnganche(sanitized);
  }, []);

  const updateMeses = useCallback((value: number) => {
    const sanitized = sanitizeMonths(value);
    console.info('Plazo en meses actualizado', sanitized);
    setMeses(sanitized);
  }, []);

  const calculateTotals = useCallback(
    (lots: Lot[]): FinanceTotals => {
      return calculateFinanceTotals(selectedIds, lots, porcentajeEnganche, meses);
    },
    [meses, porcentajeEnganche, selectedIds],
  );

  const state: LotsSelectionState = useMemo(
    () => ({ selectedIds, porcentajeEnganche, meses }),
    [selectedIds, porcentajeEnganche, meses],
  );

  return {
    state,
    toggleLot,
    clearSelection,
    setSelectedIds,
    updatePorcentaje,
    updateMeses,
    calculateTotals,
  };
};
