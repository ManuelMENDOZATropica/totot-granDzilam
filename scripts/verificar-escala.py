#!/usr/bin/env python3
"""
Mide la escala real de una imagen generada por «Imagina tu proyecto».

Por qué existe: el modelo dibuja escenas internamente coherentes pero a la escala
equivocada. Un parque de barrio y un macrolote de 8 hectáreas se ven igual de plausibles
si no tienes con qué medirlos. El cajón de estacionamiento sí sirve de patrón porque su
ancho está normado: 2.6 m en México. Los coches no sirven — el modelo los encoge junto con
todo lo demás y el error se disimula.

Uso:
    python3 scripts/verificar-escala.py imagen.jpg --lote 13
    python3 scripts/verificar-escala.py imagen.jpg --frente 101 --fondo 863

Necesita numpy, pillow y scipy.
"""
import argparse
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

# Medidas reales por lote (ver backend/src/services/imagine.prompt.ts)
LOTES = {
    13: (101, 863), 12: (101, 841), 11: (103, 811), 10: (103, 797), 9: (103, 783),
    8: (102, 778), 7: (104, 745), 6: (104, 732), 5: (103, 722), 4: (103, 707),
    3: (105, 684), 2: (103, 681), 1: (99, 622),
}

ANCHO_CAJON_M = 2.6      # norma mexicana
TOLERANCIA = 0.25        # ±25 % se considera aceptable


def detectar_coches(sub):
    """Manchas saturadas que no son vegetación: los coches del estacionamiento."""
    r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]
    mx, mn = sub.max(2), sub.min(2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    mask = (sat > 0.45) & (mx / 255.0 > 0.35) & ~((g > r) & (g > b))
    lab, _ = ndimage.label(ndimage.binary_closing(mask, np.ones((3, 3))))
    centros = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if (lab[sl] == i + 1).sum() < 12 or h < 3 or w < 2:
            continue
        if max(h, w) / max(1, min(h, w)) > 4:          # descarta tiras y sombras
            continue
        centros.append(((sl[1].start + sl[1].stop) / 2, (sl[0].start + sl[0].stop) / 2))
    return np.array(centros) if centros else np.empty((0, 2))


def paso_entre_cajones(centros):
    """Mediana de la separación entre coches contiguos de una misma fila."""
    if len(centros) < 4:
        return None, 0
    centros = centros[np.argsort(centros[:, 1])]
    filas, actual = [], [centros[0]]
    for p in centros[1:]:
        (actual.append(p) if p[1] - actual[-1][1] < 12 else (filas.append(np.array(actual)), actual.clear(), actual.append(p)))
    filas.append(np.array(actual))
    pasos = []
    for f in filas:
        if len(f) < 3:
            continue
        d = np.diff(np.sort(f[:, 0]))
        pasos.extend(d[(d > 4) & (d < 90)].tolist())
    if len(pasos) < 3:
        return None, len(pasos)
    return float(np.median(pasos)), len(pasos)


def ancho_franja_px(a):
    """Separación entre los dos linderos horizontales del lote."""
    h, w = a.shape[:2]
    col = a[:, int(0.40 * w):int(0.60 * w)].mean(1).mean(1)
    d = np.abs(np.diff(ndimage.uniform_filter1d(col, 5)))
    cand = sorted(p for p in np.argsort(d)[::-1][:40] if 0.10 * h < p < 0.90 * h)
    if len(cand) < 2:
        return None
    grupos, actual = [], [cand[0]]
    for p in cand[1:]:
        (actual.append(p) if p - actual[-1] < 20 else (grupos.append(actual), actual := [p]))
    grupos.append(actual)
    bordes = [int(np.mean(g)) for g in grupos]
    return bordes[-1] - bordes[0] if len(bordes) >= 2 else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("imagen")
    ap.add_argument("--lote", type=int, help="1-13; usa las medidas reales de ese lote")
    ap.add_argument("--frente", type=float, help="metros del lado corto")
    ap.add_argument("--fondo", type=float, help="metros del lado largo")
    args = ap.parse_args()

    if args.lote:
        frente, fondo = LOTES[args.lote]
    elif args.frente and args.fondo:
        frente, fondo = args.frente, args.fondo
    else:
        ap.error("indica --lote o bien --frente y --fondo")

    im = Image.open(args.imagen).convert("RGB")
    W, H = im.size
    a = np.asarray(im).astype(np.float32)
    print(f"imagen: {W} x {H}")
    print(f"lote esperado: {frente:.0f} m de frente x {fondo:.0f} m de fondo "
          f"({frente * fondo / 10000:.1f} ha)\n")

    # el estacionamiento suele estar junto al acceso, en el tercio izquierdo
    sub = a[int(0.25 * H):int(0.75 * H), int(0.03 * W):int(0.30 * W)]
    centros = detectar_coches(sub)
    paso, n = paso_entre_cajones(centros)
    print(f"coches detectados: {len(centros)}   medidas de paso válidas: {n}")
    if paso is None:
        print("\nNo se pudo medir: hacen falta al menos tres coches contiguos en una fila.")
        print("Genera con un concepto que incluya estacionamiento para poder verificar.")
        return 2

    escala = ANCHO_CAJON_M / paso
    print(f"paso entre cajones: {paso:.1f} px  ->  escala {escala:.4f} m/px\n")

    ancho_px = ancho_franja_px(a)
    if ancho_px:
        print(f"banda del lote: {ancho_px} px = {100 * ancho_px / H:.0f}% del alto "
              f"(en la imagen de entrada es 51%)")
        ancho_m = ancho_px * escala
        largo_m = W * escala
        ha = ancho_m * largo_m / 10000
        razon = ancho_m / frente
        print(f"{'':22s} {'medido':>12s} {'esperado':>12s} {'factor':>8s}")
        print(f"{'frente de la franja':22s} {ancho_m:9.0f} m {frente:10.0f} m {razon:8.2f}x")
        print(f"{'largo en el encuadre':22s} {largo_m:9.0f} m {fondo:10.0f} m "
              f"{largo_m / fondo:8.2f}x")
        print(f"{'superficie':22s} {ha:9.1f} ha {frente * fondo / 10000:9.1f} ha "
              f"{ha / (frente * fondo / 10000):8.2f}x")

        print(f"\ncaben {ancho_m / 2.6:.0f} cajones a lo ancho; deberían caber {frente / 2.6:.0f}")
        ok = abs(razon - 1) <= TOLERANCIA
        print("\n" + ("ESCALA CORRECTA (dentro de ±25 %)" if ok else
                      f"ESCALA MAL: todo está {1 / razon:.1f} veces más grande de lo que debería"))
        return 0 if ok else 1

    print("No se pudo localizar el lindero del lote para medir el ancho.")
    return 2


if __name__ == "__main__":
    sys.exit(main())
