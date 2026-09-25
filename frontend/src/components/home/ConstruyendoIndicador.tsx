import { useEffect, useRef, useState } from 'react';

/**
 * Indicador para la espera de «Imagina tu proyecto».
 *
 * Generar tarda unos 16 s. Un texto con pulse no alcanza para esa espera: parece que se
 * colgó. Las etapas que se muestran son las que el prompt realmente le pide al modelo, en
 * el orden en que las describe, así que lo que se lee corresponde con lo que está pasando.
 *
 * La barra avanza con una curva que se frena cerca del final y nunca llega al 100 % sola:
 * el salto a completo lo da el resultado real. Fingir un porcentaje exacto sería mentir
 * sobre algo que no se puede medir.
 */

const ETAPAS = [
  'Leyendo la fotografía del terreno',
  'Trazando el acceso desde la carretera',
  'Levantando las construcciones',
  'Sembrando la vegetación',
  'Ajustando la luz y las sombras',
] as const;

/** Duración típica observada de una generación, en ms. */
const DURACION_ESTIMADA = 16000;

interface Props {
  activo: boolean;
  /** Número de lote, si el cliente eligió uno. */
  numeroLote?: number;
}

export const ConstruyendoIndicador = ({ activo, numeroLote }: Props) => {
  const [etapa, setEtapa] = useState(0);
  const [avance, setAvance] = useState(0);
  const inicio = useRef<number>(0);

  useEffect(() => {
    if (!activo) {
      setEtapa(0);
      setAvance(0);
      return;
    }

    inicio.current = Date.now();
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const id = window.setInterval(() => {
      const t = (Date.now() - inicio.current) / DURACION_ESTIMADA;
      // Curva que frena: 0 → ~0.92 y de ahí se arrastra. El 100 % lo pone el resultado.
      setAvance(Math.min(0.94, 1 - Math.exp(-1.9 * t)));
      setEtapa(Math.min(ETAPAS.length - 1, Math.floor(t * ETAPAS.length)));
    }, reducido ? 900 : 120);

    return () => window.clearInterval(id);
  }, [activo]);

  if (!activo) return null;

  return (
    <div
      className="mt-3 max-w-sm ml-auto rounded-2xl bg-slate-900/70 px-4 py-3 text-left backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-white">
          {ETAPAS[etapa]}
          <span className="inline-block w-5 text-left text-white/70">
            <span className="animate-pulse">…</span>
          </span>
        </p>
        {numeroLote ? (
          <span className="shrink-0 text-[11px] uppercase tracking-wider text-white/60">
            Lote {numeroLote}
          </span>
        ) : null}
      </div>

      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-emerald-300 transition-[width] duration-200 ease-out"
          style={{ width: `${Math.round(avance * 100)}%` }}
        />
      </div>

      <ol className="mt-2 flex gap-1" aria-hidden>
        {ETAPAS.map((nombre, i) => (
          <li
            key={nombre}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= etapa ? 'bg-emerald-300/80' : 'bg-white/15'
            }`}
          />
        ))}
      </ol>
    </div>
  );
};

export default ConstruyendoIndicador;
