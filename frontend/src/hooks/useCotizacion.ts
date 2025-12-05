import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerLotes, type LoteDTO, type LotsResponse } from '@/lib/api';
import { fetchFinanceSettings, type FinanceSettingsDTO } from '@/lib/financeSettings';

export type Lote = LoteDTO;

export interface TotalesCotizacion {
  totalSeleccionado: number;
  totalConDescuento: number;
  descuentoAplicado: number;
  descuentoPorcentaje: number;
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
const MAX_ENGANCHE = 100;
const MIN_MESES = 1;
const MAX_MESES = 24;

const calcularDescuento = (porcentajeEnganche: number) => {
  if (porcentajeEnganche >= 100) return 0.15;
  if (porcentajeEnganche >= 70) return 0.1;
  if (porcentajeEnganche >= 50) return 0.05;
  return 0;
};

const clamp = (valor: number, minimo: number, maximo: number) => {
  return Math.min(Math.max(valor, minimo), maximo);
};

const DEFAULT_SETTINGS: FinanceSettingsDTO = {
  minEnganche: MIN_ENGANCHE,
  maxEnganche: MAX_ENGANCHE,
  defaultEnganche: 30,
  minMeses: MIN_MESES,
  maxMeses: MAX_MESES,
  defaultMeses: 12,
  interes: 0,
};

const normalizarConfiguracion = (settings: FinanceSettingsDTO): FinanceSettingsDTO => {
  const minEnganche = Math.min(settings.minEnganche ?? MIN_ENGANCHE, MIN_ENGANCHE);
  const maxEnganche = Math.max(settings.maxEnganche ?? MAX_ENGANCHE, MAX_ENGANCHE);
  const minMeses = Math.max(settings.minMeses ?? MIN_MESES, MIN_MESES);
  const maxMeses = Math.min(settings.maxMeses ?? MAX_MESES, MAX_MESES);

  return {
    ...settings,
    minEnganche,
    maxEnganche,
    minMeses,
    maxMeses,
    defaultEnganche: clamp(settings.defaultEnganche ?? DEFAULT_SETTINGS.defaultEnganche, minEnganche, maxEnganche),
    defaultMeses: clamp(settings.defaultMeses ?? DEFAULT_SETTINGS.defaultMeses, minMeses, maxMeses),
  };
};

const sanitizePercentage = (valor: number, settings: FinanceSettingsDTO) => {
  const parsed = Number.isFinite(valor) ? Math.round(valor) : settings.defaultEnganche;
  return clamp(parsed, settings.minEnganche, settings.maxEnganche);
};

const sanitizeMonths = (valor: number, settings: FinanceSettingsDTO) => {
  const parsed = Number.isFinite(valor) ? Math.round(valor) : settings.defaultMeses;
  return clamp(parsed, settings.minMeses, settings.maxMeses);
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
    porcentaje: DEFAULT_SETTINGS.defaultEnganche,
    meses: DEFAULT_SETTINGS.defaultMeses,
  });

const calcularTotales = (
  lotes: Lote[],
  porcentaje: number,
  meses: number,
  settings: FinanceSettingsDTO,
): TotalesCotizacion => {
  if (!lotes.length) {
    return {
      totalSeleccionado: 0,
      totalConDescuento: 0,
      descuentoAplicado: 0,
      descuentoPorcentaje: 0,
      enganche: 0,
      saldoFinanciar: 0,
      mensualidad: 0,
    };
  }

  const totalSeleccionado = lotes.reduce((acum, lote) => acum + lote.precio, 0);
  const porcentajeSanitizado = sanitizePercentage(porcentaje, settings) / 100;
  const mesesSanitizados = sanitizeMonths(meses, settings);
  const descuentoPorcentaje = calcularDescuento(porcentajeSanitizado * 100);
  const totalConDescuento = Math.max(totalSeleccionado * (1 - descuentoPorcentaje), 0);
  const descuentoAplicado = Math.max(totalSeleccionado - totalConDescuento, 0);
  const enganche = Math.round(totalConDescuento * porcentajeSanitizado);
  const saldoFinanciar = Math.max(totalConDescuento - enganche, 0);
  const interesAdicional = settings.interes > 0 ? Math.round(saldoFinanciar * (settings.interes / 100)) : 0;
  const mensualidad = mesesSanitizados > 0 ? Math.round((saldoFinanciar + interesAdicional) / mesesSanitizados) : 0;

  return {
    totalSeleccionado,
    totalConDescuento,
    descuentoAplicado,
    descuentoPorcentaje,
    enganche,
    saldoFinanciar,
    mensualidad,
  };
};

export const useCotizacion = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [lotsMeta, setLotsMeta] = useState<Pick<LotsResponse, 'total' | 'page' | 'pageSize'>>({
    total: 0,
    page: 1,
    pageSize: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [porcentajeEnganche, setPorcentajeEnganche] = useState(() => DEFAULT_SETTINGS.defaultEnganche);
  const [meses, setMeses] = useState(() => DEFAULT_SETTINGS.defaultMeses);
  const [financeSettings, setFinanceSettings] = useState<FinanceSettingsDTO>(DEFAULT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [hydratedFromStorage, setHydratedFromStorage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const cargarLotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerLotes(controller.signal);
        if (!cancelled) {
          setLotes(data.items);
          setLotsMeta({ total: data.total, page: data.page, pageSize: data.pageSize });
        }
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        console.error(err);
        setError('No se pudo obtener la lista de lotes');
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
    let cancelled = false;

    const loadSettings = async () => {
      setLoadingSettings(true);
      try {
        const settings = normalizarConfiguracion(await fetchFinanceSettings());
        if (!cancelled) {
          setFinanceSettings(settings);
          setPorcentajeEnganche((prev) => sanitizePercentage(prev, settings));
          setMeses((prev) => sanitizeMonths(prev, settings));
        }
      } catch (error) {
        console.warn('No se pudo obtener la configuración de financiamiento', error);
      } finally {
        if (!cancelled) {
          setLoadingSettings(false);
        }
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const storedSelection = leerLocalStorage<string[] | null>(SELECCION_STORAGE_KEY, null);
    const storedParams = leerParametrosIniciales();

    if (storedSelection) {
      setSelectedIds(storedSelection);
    }

    setPorcentajeEnganche(sanitizePercentage(storedParams.porcentaje, financeSettings));
    setMeses(sanitizeMonths(storedParams.meses, financeSettings));
    setHydratedFromStorage(true);
    // financeSettings solo cambia cuando llega la configuración remota, por lo que
    // este efecto usa la versión más reciente para sanear valores persistidos.
  }, [financeSettings]);

  useEffect(() => {
    if (!hydratedFromStorage) return;
    escribirLocalStorage(SELECCION_STORAGE_KEY, selectedIds);
  }, [hydratedFromStorage, selectedIds]);

  useEffect(() => {
    if (!hydratedFromStorage) return;
    escribirLocalStorage(PARAMETROS_STORAGE_KEY, {
      porcentaje: porcentajeEnganche,
      meses,
    });
  }, [hydratedFromStorage, porcentajeEnganche, meses]);

  const selectedLots = useMemo(() => {
    if (!selectedIds.length) return [] as Lote[];
    return selectedIds
      .map((id) => lotes.find((lote) => lote.id === id))
      .filter((lote): lote is Lote => Boolean(lote));
  }, [lotes, selectedIds]);

  const totales = useMemo(
    () => calcularTotales(selectedLots, porcentajeEnganche, meses, financeSettings),
    [selectedLots, porcentajeEnganche, meses, financeSettings],
  );

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

  const actualizarPorcentaje = useCallback(
    (valor: number) => {
      setPorcentajeEnganche(sanitizePercentage(valor, financeSettings));
    },
    [financeSettings],
  );

  const actualizarMeses = useCallback(
    (valor: number) => {
      setMeses(sanitizeMonths(valor, financeSettings));
    },
    [financeSettings],
  );

  return {
    lotes,
    lotsMeta,
    loading,
    error,
    financeSettings,
    loadingFinanceSettings: loadingSettings,
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
