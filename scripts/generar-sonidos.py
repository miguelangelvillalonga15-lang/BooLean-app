# Sintetiza los sonidos provisorios de BooLean (se pueden reemplazar por grabaciones reales).
# Uso: python3 scripts/generar-sonidos.py assets/sonidos   (necesita numpy)
import sys, wave
import numpy as np
SR = 22050
out = sys.argv[1]
rng = np.random.default_rng(7)

def t(d): return np.arange(int(SR * d)) / SR

def env(n, ataque=0.005, caida=6.0):
    x = np.arange(n) / SR
    a = np.clip(x / ataque, 0, 1)
    return a * np.exp(-x * caida)

def nota(f, d, caida=8.0, armonicos=(1, 0.3, 0.1)):
    x = t(d)
    s = sum(a * np.sin(2 * np.pi * f * (k + 1) * x) for k, a in enumerate(armonicos))
    return s * env(len(x), caida=caida)

def unir(*partes, gap=0.0):
    sil = np.zeros(int(SR * gap))
    res = []
    for p in partes:
        res += [p, sil]
    return np.concatenate(res)

def mezclar(a, b, desde=0.0):
    i = int(SR * desde)
    n = max(len(a), i + len(b))
    r = np.zeros(n); r[:len(a)] += a; r[i:i + len(b)] += b
    return r

def miau(d=0.42, base=620):
    x = t(d)
    # Tono: sube y baja ("mi-au") con un poquito de vibrato
    perfil = np.interp(x / d, [0, 0.35, 1], [base, base * 1.45, base * 0.95])
    perfil *= 1 + 0.015 * np.sin(2 * np.pi * 7 * x)
    fase = 2 * np.pi * np.cumsum(perfil) / SR
    # Timbre: brillante al principio ("i"), más oscuro al final ("au")
    brillo = np.interp(x / d, [0, 0.4, 1], [1.0, 0.7, 0.25])
    s = sum((brillo ** k) * np.sin((k + 1) * fase) / (k + 1) for k in range(8))
    e = np.interp(x / d, [0, 0.08, 0.7, 1], [0, 1, 0.8, 0])
    return s * e

def ronroneo(d=1.3):
    x = t(d)
    ruido = rng.normal(0, 1, len(x))
    # Filtro pasa-bajos simple
    k = 40
    grave = np.convolve(ruido, np.ones(k) / k, mode='same')
    pulsos = 0.5 + 0.5 * np.sin(2 * np.pi * 26 * x) ** 2
    respiracion = 0.4 + 0.6 * np.abs(np.sin(np.pi * x / (d / 2)))
    return grave * pulsos * respiracion * np.interp(x / d, [0, 0.1, 0.85, 1], [0, 1, 1, 0])

def clic():
    x = t(0.03)
    r = rng.normal(0, 1, len(x))
    r = np.diff(r, prepend=0)  # más agudo
    return r * np.exp(-x * 220)

def impresora():
    x = t(0.12)
    r = rng.normal(0, 1, len(x)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 70 * x)))
    return r * np.interp(x, [0, 0.01, 0.1, 0.12], [0, 1, 0.6, 0]) * 0.5

def sello():
    x = t(0.3)
    golpe = np.sin(2 * np.pi * np.interp(x, [0, 0.3], [160, 60]) * x) * np.exp(-x * 18)
    return golpe + np.pad(clic(), (0, len(x) - len(clic()))) * 0.6

def guardar(nombre, s, vol=0.8):
    s = s / (np.max(np.abs(s)) + 1e-9) * vol
    data = (s * 32767).astype(np.int16)
    with wave.open(f'{out}/{nombre}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())

guardar('acierto', mezclar(miau(0.34, 700), unir(nota(1568, 0.25, 10), gap=0) * 0.25, 0.18), 0.7)
guardar('error', unir(nota(392, 0.14, 12, (1, 0.5, 0.2)), nota(294, 0.25, 9, (1, 0.5, 0.2)), gap=0.02), 0.5)
guardar('combo', unir(nota(1047, 0.1, 14), nota(1319, 0.1, 14), nota(1568, 0.1, 14), nota(2093, 0.3, 8)), 0.55)
guardar('terminar', mezclar(ronroneo(1.2), unir(nota(784, 0.15), nota(988, 0.15), nota(1175, 0.4, 5)) * 0.35, 0.1), 0.7)
guardar('ronroneo', ronroneo(1.4), 0.75)
guardar('miau', miau(0.5, 600), 0.75)
guardar('clic', clic(), 0.35)
guardar('impresora', impresora(), 0.4)
guardar('sello', sello(), 0.8)
print('Sonidos generados en', out)
