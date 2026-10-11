"""
Diseño sonoro de la muestra, sintetizado desde cero (sin samples de terceros,
así no hay problemas de licencia al publicar en LinkedIn).

Genera public/audio/muestra-sonido.wav (estéreo, 48 kHz, 10 s):
  - cama musical: pad oscuro en La menor + pulso grave suave a 96 BPM
  - efectos sincronizados con la animación (tiempos en segundos = frame / 30)

Para el video final, la voz real de Alan se mezcla encima con ducking
(la música baja automáticamente cuando él habla).
"""

import os
import wave

import numpy as np

SR = 48_000
DUR = 10.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)


def f(frame):
    return frame / 30.0


def lowpass(x, cutoff):
    """Filtro de un polo, suficiente para suavizar ruido y sierras."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def env(start, attack, decay, length=None):
    """Envolvente exponencial que arranca en `start` (s)."""
    e = np.zeros(N)
    s = int(start * SR)
    length = length or attack + decay * 6
    n = min(int(length * SR), N - s)
    if n <= 0:
        return e
    tt = np.arange(n) / SR
    att = np.clip(tt / max(attack, 1e-4), 0, 1)
    dec = np.exp(-np.maximum(tt - attack, 0) / decay)
    e[s : s + n] = att * dec
    return e


def note(freq):
    return 440.0 * 2 ** ((freq - 69) / 12)


# ---------------------------------------------------------------- música
def pad():
    out = np.zeros(N)
    chords = [(0.0, [57, 60, 64, 69]), (5.0, [53, 57, 60, 65])]  # Am → F
    for i, (start, notes) in enumerate(chords):
        end = chords[i + 1][0] if i + 1 < len(chords) else DUR
        gate = np.clip((t - start) / 1.2, 0, 1) * np.clip((end + 0.6 - t) / 1.2, 0, 1)
        for m in notes:
            for detune in (-0.07, 0.0, 0.06):
                fr = note(m + detune)
                saw = 2 * ((t * fr) % 1.0) - 1
                out += saw * gate * 0.05
    out = lowpass(lowpass(out, 900), 1400)
    swell = 0.55 + 0.45 * np.clip(t / 3.0, 0, 1)
    return out * swell


def sub_pulse():
    out = np.zeros(N)
    beat = 60 / 96
    k = 0
    while k * beat < DUR:
        st = k * beat
        if st >= f(112) - 0.05:  # el pulso entra con la presentación
            e = env(st, 0.005, 0.18, 0.8)
            root = 45 if st < 5.0 else 41
            out += np.sin(2 * np.pi * note(root - 12) * t) * e * 0.35
        k += 1
    return out


# ---------------------------------------------------------------- efectos
def hit(start, gain=1.0):
    """Golpe grave cinematográfico: seno con caída de pitch + cola de ruido."""
    s = int(start * SR)
    n = int(2.2 * SR)
    tt = np.arange(n) / SR
    freq = 38 + 70 * np.exp(-tt * 18)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.exp(-tt / 0.55)
    noise = lowpass(rng.standard_normal(n), 500) * np.exp(-tt / 0.25) * 0.6
    out = np.zeros(N)
    m = min(n, N - s)
    out[s : s + m] = (body + noise)[:m] * gain
    return out


def tick(start, gain=0.25):
    """Clic seco para cada línea de texto que aparece."""
    e = env(start, 0.001, 0.012, 0.08)
    return np.sin(2 * np.pi * 2400 * t) * e * gain + rng.standard_normal(N) * e * gain * 0.4


def whoosh(start, length, gain=0.5, rising=True):
    """Ruido filtrado con barrido: transiciones y la línea azul."""
    s = int(start * SR)
    n = min(int(length * SR), N - s)
    tt = np.linspace(0, 1, n)
    shape = np.sin(np.pi * tt) ** 2
    noise = rng.standard_normal(n)
    lo = lowpass(noise, 600)
    hi = noise - lowpass(noise, 2500)
    mix = (lo * (1 - tt) + hi * tt) if rising else (hi * (1 - tt) + lo * tt)
    out = np.zeros(N)
    out[s : s + n] = mix * shape * gain
    return out


def riser(start, length, gain=0.18):
    s = int(start * SR)
    n = min(int(length * SR), N - s)
    tt = np.arange(n) / SR
    freq = 300 * (1 + 3 * (tt / length) ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    out = np.zeros(N)
    out[s : s + n] = tone * (tt / length) ** 2 * gain
    return out


def stereo(x, pan):
    """pan -1 (izq) … 1 (der), ley de potencia constante."""
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def haas(x, ms=11):
    d = int(SR * ms / 1000)
    r = np.concatenate([np.zeros(d), x[:-d]])
    return np.stack([x, r], axis=1)


def reverb(x, wet=0.25):
    """Reverb simple por retardos múltiples, para dar aire."""
    y = x.copy()
    for ms, g in [(37, 0.5), (53, 0.42), (71, 0.35), (97, 0.28), (131, 0.2), (173, 0.14)]:
        d = int(SR * ms / 1000)
        y[d:] += x[:-d] * g
    return x * (1 - wet) + lowpass(y, 5000) * wet


mix = np.zeros((N, 2))
mix += haas(pad() * 0.9)
mix += stereo(sub_pulse(), 0)

mix += stereo(hit(0.0, 0.9), 0)
for i in range(3):  # aparición de cada problema
    mix += stereo(reverb(tick(f(8 + i * 16))), -0.3 + 0.3 * i)
for i in range(3):  # tachado azul
    mix += stereo(whoosh(f(62 + i * 6), 0.35, 0.16), -0.4 + 0.4 * i)
mix += haas(reverb(whoosh(f(92), 0.65, 0.42)))  # la línea cruza la pantalla
mix += stereo(hit(f(112), 0.55), 0)  # entra Alan
mix += stereo(reverb(tick(f(62 + 112), 0.18)), 0.2)  # logo
mix += haas(riser(f(190), f(30)))
mix += haas(reverb(whoosh(f(206), 0.55, 0.45)))
mix += stereo(hit(f(220), 0.6), 0)  # entra el proyecto

# fade de salida + normalización a -1 dBFS
fade = np.clip((DUR - t) / 0.6, 0, 1)[:, None]
mix *= fade
mix = np.tanh(mix * 1.1)
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))

out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
os.makedirs(out_dir, exist_ok=True)
path = os.path.join(out_dir, "muestra-sonido.wav")
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok:", os.path.normpath(path))
