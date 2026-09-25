import fs from 'fs';
import path from 'path';

/**
 * Construcción del prompt para editar la ortofoto de un lote.
 *
 * Diferencia con el sistema anterior: antes el terreno se DESCRIBÍA con palabras
 * («un rectángulo de 100 × 800 m con bosque a la izquierda»), así que cada generación
 * inventaba un predio distinto. Ahora el terreno se MANDA como imagen y el prompt solo
 * dice qué construir dentro y qué no tocar fuera.
 *
 * El otro cambio importante: la idea del usuario se pasa tal cual. El builder anterior
 * la inflaba — «una cabaña» se convertía en «torres residenciales, zonas comerciales,
 * estacionamientos» — y por eso todos los resultados se parecían entre sí.
 */

/**
 * Medidas reales por lote, en metros.
 *
 * Los m² salen de la API y coinciden con la página «PLANOS y SUPERFICIES» del brochure.
 * El frente y el fondo se derivaron midiendo los polígonos del render contra esos m²
 * (escala 0.3198 m/px); el error contra la superficie declarada queda dentro de ±3 %.
 *
 * Importante: el frente es casi constante —el brochure promete «más de 100 m lineales de
 * frente»— y lo que cambia de un lote a otro es el FONDO, de 622 a 863 m. Antes se mandaba
 * 102 × 757 m para todos, y por eso la escala de las imágenes no correspondía.
 */
export const LOTES: Record<number, { frenteM: number; fondoM: number; areaM2: number }> = {
  13: { frenteM: 101, fondoM: 863, areaM2: 86938 },
  12: { frenteM: 101, fondoM: 841, areaM2: 85399 },
  11: { frenteM: 103, fondoM: 811, areaM2: 83860 },
  10: { frenteM: 103, fondoM: 797, areaM2: 82321 },
  9: { frenteM: 103, fondoM: 783, areaM2: 80782 },
  8: { frenteM: 102, fondoM: 778, areaM2: 79243 },
  7: { frenteM: 104, fondoM: 745, areaM2: 77703 },
  6: { frenteM: 104, fondoM: 732, areaM2: 76164 },
  5: { frenteM: 103, fondoM: 722, areaM2: 74525 },
  4: { frenteM: 103, fondoM: 707, areaM2: 73086 },
  3: { frenteM: 105, fondoM: 684, areaM2: 71546 },
  2: { frenteM: 103, fondoM: 681, areaM2: 70007 },
  1: { frenteM: 99, fondoM: 622, areaM2: 61557 },
};

const resolverRuta = (...partes: string[]) => {
  const candidatos = [
    path.join(process.cwd(), 'src', 'IA', ...partes),
    path.join(__dirname, '..', 'IA', ...partes),
    path.join(__dirname, 'IA', ...partes),
  ];
  const encontrado = candidatos.find((c) => fs.existsSync(c));
  if (!encontrado) throw new Error(`No se encontró el recurso de IA: ${partes.join('/')}`);
  return encontrado;
};

let plantilla: string | null = null;
const cargarPlantilla = () => {
  if (!plantilla) plantilla = fs.readFileSync(resolverRuta('promptEdicionLote.txt'), 'utf8');
  return plantilla;
};

/**
 * Fotos de desarrollos ya construidos que se mandan junto a la ortofoto. No son para
 * copiarlas: son la única forma fiable de comunicarle al modelo QUÉ TAN DENSO y QUÉ TAN
 * PEQUEÑO debe ser cada elemento. Describirlo con palabras no bastaba: el modelo ponía
 * pocos objetos y grandes, agrupados junto a la carretera.
 * El orden importa, el prompt las nombra como imágenes 2, 3 y 4.
 */
/**
 * Dónde cae la banda del lote dentro del recorte 21:9, medido sobre los propios archivos
 * de backend/src/IA/lotes. Es idéntico en los 13 porque todos se encuadran igual.
 * El modelo tiende a estrechar la banda; decírselo en porcentaje es lo único accionable.
 */
export const BANDA = { porcentaje: 51, superior: 25, inferior: 76 } as const;

const REFERENCIAS = ['densidad-franja.jpg', 'densidad-parcelas.jpg', 'densidad-resort.jpg'];

export const cargarReferenciasDensidad = (): { data: string; mimeType: 'image/jpeg' }[] =>
  REFERENCIAS.map((nombre) => ({
    data: fs.readFileSync(resolverRuta('referencias', nombre)).toString('base64'),
    mimeType: 'image/jpeg' as const,
  }));

/** Devuelve la ortofoto recortada del lote, en base64, lista para mandar a Gemini. */
export const cargarImagenLote = (numeroLote: number): { data: string; mimeType: 'image/jpeg' } => {
  const n = Math.min(13, Math.max(1, Math.round(numeroLote)));
  const archivo = resolverRuta('lotes', `lote-${String(n).padStart(2, '0')}.jpg`);
  return { data: fs.readFileSync(archivo).toString('base64'), mimeType: 'image/jpeg' };
};

/**
 * Enriquece la idea del usuario SIN sustituirla. Solo añade el contexto que el modelo no
 * puede adivinar (clima, materiales de la zona) y, si la idea es de una sola pieza, aclara
 * que el resto del lote se queda como está en vez de rellenarlo de edificios.
 */
export const construirConcepto = (idea: string): string => {
  const limpia = idea.trim();
  if (!limpia) {
    return 'A low-density tropical development: a few buildings near the road frontage, paths into the plot, and the rest of the selva preserved.';
  }

  const palabras = limpia.split(/\s+/).length;
  const contexto =
    'Context: hot humid tropical Yucatán. Typical materials are white stucco, local limestone, ' +
    'tropical hardwood and palm thatch (palapa). Vegetation is tropical dry forest with palms.';

  if (palabras <= 5) {
    // Idea de una sola pieza: lo importante es que NO invente un desarrollo entero.
    return `The client asked for: "${limpia}".\n${contexto}\nBuild exactly that, at a believable size, placed sensibly on the plot with an access path from the road. Do not invent an entire masterplan around it: the rest of the plot stays as it is today.`;
  }

  return `The client asked for: "${limpia}".\n${contexto}\nInterpret it faithfully. Do not scale it up into something the client did not ask for.`;
};

export interface DatosPromptLote {
  idea: string;
  numeroLote: number;
}

/**
 * Prompt para refinar una imagen ya generada. Aquí NO se repite la plantilla completa:
 * la interacción anterior ya lleva la ortofoto y las reglas, y repetirlas hace que el
 * modelo vuelva a dibujar todo desde cero en vez de retocar lo que hay.
 */
export const construirPromptRefinamiento = (instruccion: string): string =>
  `Adjust the previous image with this change: "${instruccion.trim()}".\n` +
  'Change only what that asks for. Keep everything else identical: same buildings in the ' +
  'same places, same vegetation, same camera, same light, same style. ' +
  'Do not redraw the scene from scratch. No text or labels.';

export const construirPromptEdicion = ({ idea, numeroLote }: DatosPromptLote): string => {
  const lote = LOTES[numeroLote] ?? LOTES[7];
  // Anclas de escala: dar sólo metros no basta, el modelo necesita contra qué compararlos.
  // Anclas absolutas y contables. Las relativas («un catorceavo del lado corto») no
  // sirven: el modelo las cumple dentro de su propia escala inventada. Un cajón de
  // estacionamiento mide 2.6 m por norma y eso sí se puede verificar en la imagen.
  const cajones = String(Math.round(lote.frenteM / 2.6));
  // El banco de 10 variantes (scripts/, bitácora en el commit) mostró que las anclas
  // métricas no sirven: el modelo las cumple dentro de una escala que él mismo inventa.
  // Lo único que movió la aguja fue abrir nombrando el fallo y exigir el grosor de banda.
  return cargarPlantilla()
    .replace('{LOTE}', `Lote ${numeroLote}`)
    .replace('{FRENTE}', String(lote.frenteM))
    .replace('{FONDO}', String(lote.fondoM))
    .replace('{AREA}', lote.areaM2.toLocaleString('en-US'))
    .replace('{HECTAREAS}', (lote.areaM2 / 10000).toFixed(1))
    .replace('{BANDA}', String(BANDA.porcentaje))
    .replace('{CAJONES}', cajones)
    .replace('{CONCEPTO}', construirConcepto(idea));
};
