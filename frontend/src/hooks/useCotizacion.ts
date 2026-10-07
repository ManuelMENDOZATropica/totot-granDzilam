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
  saldoContraEntrega: number;
  pagadoEnMensualidades: number;
  restante: number;
}

interface ParametrosCotizacionStorage {
  porcentaje: number;
  meses: number;
  mensualidadPersonalizada: number | null;
}

const SELECCION_STORAGE_KEY = 'gran-dzilam:seleccion';
const PARAMETROS_STORAGE_KEY = 'gran-dzilam:parametros';

/**
 * Rango físico dentro del que tiene sentido cada valor, no una política comercial: un
 * enganche no puede pasar del 100 % y un plazo no puede ser de cero meses. Lo que el
 * admin configure vive dentro de esto, y manda.
 */
const MIN_ENGANCHE = 0;
const MAX_ENGANCHE = 100;
const MIN_MESES = 1;
const MAX_MESES = 120;

/**
 * Lo que se usa mientras el servidor no ha respondido.
 *
 * Los límites se alinean con el modelo de Mongo
 * (backend/src/models/finance-settings.model.ts), que antes decían aquí 10–100 % y 1–50
 * meses. Los valores por defecto se quedan como estaban a propósito: son los que ve un
 * visitante nuevo, y cambiarlos movería la cotización que aparece de entrada.
 *
 * Ojo: hoy el `defaultMeses` que configura el admin no se usa nunca. Al llegar la
 * configuración solo se ajusta el valor actual a los nuevos límites, no se adopta su
 * default, así que un visitante nuevo arranca en estos 12 meses y no en los 24 que tiene
 * puesto producción. Es un caso aparte del de los límites y se deja como está.
 */
const DEFAULT_SETTINGS: FinanceSettingsDTO = {
  minEnganche: 10,
  maxEnganche: 80,
  defaultEnganche: 30,
  minMeses: 6,
  maxMeses: 60,
  defaultMeses: 12,
  interes: 0,
  tipoInteres: 'total',
  pasoMensualidad: 1000,
  mensualidadCerrada: 0,
};

/**
 * Descuento por tramo de enganche. Copia exacta de calcularDescuento en
 * backend/src/utils/finance.ts: si cambia uno, cambia el otro.
 */
const calcularDescuento = (porcentajeEnganche: number) => {
  if (porcentajeEnganche >= 100) return 0.15;
  if (porcentajeEnganche >= 70) return 0.1;
  if (porcentajeEnganche >= 50) return 0.05;
  return 0;
};

const clamp = (valor: number, minimo: number, maximo: number) => {
  return Math.min(Math.max(valor, minimo), maximo);
};

/**
 * Mensualidad de un crédito amortizado (sistema francés), con tasa anual nominal.
 *   pago = P · i / (1 − (1 + i)^−n)   con i = tasa anual / 12
 * Copia exacta de mensualidadAmortizada en backend/src/utils/finance.ts.
 */
const mensualidadAmortizada = (saldo: number, tasaAnual: number, meses: number) => {
  const i = tasaAnual / 100 / 12;
  if (i <= 0) return saldo / meses;
  return (saldo * i) / (1 - Math.pow(1 + i, -meses));
};

/**
 * Los límites que fija el admin mandan; MIN_* y MAX_* son solo el rango físico dentro del
 * que tienen sentido.
 *
 * Antes esto hacía `Math.min(minEnganche, 10)` y `Math.max(maxEnganche, 100)`, o sea
 * ensanchaba SIEMPRE el rango a 10–100 % y tiraba lo que el admin hubiera puesto.
 * Producción tenía configurado 20–80 % y el slider público iba de 10 a 100. Como el
 * descuento sube por tramos (50 % → 5 %, 70 % → 10 %, 100 % → 15 %), topar en 80 % era la
 * forma de desactivar el tramo del 15 %, y el visitante podía llevárselo igual.
 */
const normalizarConfiguracion = (settings: FinanceSettingsDTO): FinanceSettingsDTO => {
  const minEnganche = clamp(settings.minEnganche ?? MIN_ENGANCHE, MIN_ENGANCHE, MAX_ENGANCHE);
  const maxEnganche = clamp(settings.maxEnganche ?? MAX_ENGANCHE, minEnganche, MAX_ENGANCHE);
  const minMeses = clamp(settings.minMeses ?? MIN_MESES, MIN_MESES, MAX_MESES);
  const maxMeses = clamp(settings.maxMeses ?? MAX_MESES, minMeses, MAX_MESES);

  return {
    ...settings,
    minEnganche,
    maxEnganche,
    minMeses,
    maxMeses,
    defaultEnganche: clamp(
      settings.defaultEnganche ?? DEFAULT_SETTINGS.defaultEnganche,
      minEnganche,
      maxEnganche,
    ),
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

const leerLocalStorage = <T>(key: string, fallback: T): T => {
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

const escribirLocalStorage = <T>(key: string, value: T) => {
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
    mensualidadPersonalizada: null,
  });

const calcularTotales = (
  lotes: Lote[],
  porcentaje: number,
  meses: number,
  settings: FinanceSettingsDTO,
  mensualidadPersonalizada: number | null,
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
      saldoContraEntrega: 0,
      pagadoEnMensualidades: 0,
      restante: 0,
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
  const tasa = Math.max(settings.interes, 0);

  /**
   * Antes esto era siempre `saldo * interes/100`: un recargo único, sin importar el
   * plazo. El backend ya distingue los dos modos desde M4 y aquí seguía el viejo, así
   * que el día que alguien pusiera una tasa, la web y /api/finance/simulate iban a dar
   * números distintos. Se calcula exacto y se redondea al final, igual que allí.
   */
  const mensualidadExacta =
    mesesSanitizados > 0
      ? settings.tipoInteres === 'anual'
        ? mensualidadAmortizada(saldoFinanciar, tasa, mesesSanitizados)
        : (saldoFinanciar + (tasa > 0 ? saldoFinanciar * (tasa / 100) : 0)) / mesesSanitizados
      : 0;

  const mensualidadBase = Math.round(mensualidadExacta);
  const totalMensualidades = mensualidadExacta * mesesSanitizados;

  const pasoMensualidad = Math.max(Math.round(settings.pasoMensualidad || 1), 1);
  const mensualidadRedondeada =
    settings.mensualidadCerrada > 0
      ? Math.max(
          Math.round(settings.mensualidadCerrada / pasoMensualidad) * pasoMensualidad,
          pasoMensualidad,
        )
      : null;
  // La mensualidad pactada solo puede bajar el pago, nunca subirlo.
  const mensualidadAjustada =
    mensualidadRedondeada !== null
      ? Math.min(mensualidadRedondeada, mensualidadBase)
      : mensualidadBase;
  const saldoContraEntrega =
    mensualidadAjustada < mensualidadBase
      ? Math.round(Math.max(totalMensualidades - mensualidadAjustada * mesesSanitizados, 0))
      : 0;

  // Lo que la cotización enseña al cliente: enganche, N mensualidades y lo que queda.
  const pagadoEnMensualidades = mensualidadAjustada * mesesSanitizados;
  const restante = Math.max(totalConDescuento - pagadoEnMensualidades - enganche, 0);

  return {
    totalSeleccionado,
    totalConDescuento,
    descuentoAplicado,
    descuentoPorcentaje,
    enganche,
    saldoFinanciar,
    mensualidad: mensualidadAjustada,
    saldoContraEntrega,
    pagadoEnMensualidades,
    restante,
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
  const [porcentajeEnganche, setPorcentajeEnganche] = useState(
    () => DEFAULT_SETTINGS.defaultEnganche,
  );
  const [meses, setMeses] = useState(() => DEFAULT_SETTINGS.defaultMeses);
  const [mensualidadPersonalizada, setMensualidadPersonalizada] = useState<number | null>(null);
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
    setMensualidadPersonalizada(storedParams.mensualidadPersonalizada);
    setHydratedFromStorage(true);
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
      mensualidadPersonalizada,
    });
  }, [hydratedFromStorage, porcentajeEnganche, meses, mensualidadPersonalizada]);

  const selectedLots = useMemo(() => {
    if (!selectedIds.length) return [] as Lote[];
    return selectedIds
      .map((id) => lotes.find((lote) => lote.id === id))
      .filter((lote): lote is Lote => Boolean(lote));
  }, [lotes, selectedIds]);

  const totales = useMemo(
    () =>
      calcularTotales(
        selectedLots,
        porcentajeEnganche,
        meses,
        financeSettings,
        mensualidadPersonalizada,
      ),
    [selectedLots, porcentajeEnganche, meses, financeSettings, mensualidadPersonalizada],
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

  const actualizarMensualidadPersonalizada = useCallback(
    (valor: number | null) => {
      if (valor === null || !Number.isFinite(valor) || valor <= 0) {
        setMensualidadPersonalizada(null);
        return;
      }

      const paso = Math.max(Math.round(financeSettings.pasoMensualidad || 1), 1);
      const valorRedondeado = Math.max(Math.round(valor / paso) * paso, paso);
      setMensualidadPersonalizada(valorRedondeado);
    },
    [financeSettings.pasoMensualidad],
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
    mensualidadPersonalizada,
    actualizarMensualidadPersonalizada,
  };
};
