"""
Diseño sonoro de la apertura, sintetizado desde cero (sin samples de terceros,
así no hay problemas de licencia al publicar en LinkedIn o WhatsApp).

Genera public/audio/apertura-sonido.wav (estéreo, 48 kHz, 10 s). Cada sonido
está atado a un evento visual (tiempos en frames a 30 fps, igual que en
src/Apertura.tsx):

  0–96     pad oscuro en La menor + tipeo que se acelera (la planilla)
  96–240   tensión: errores, mensajes que llegan, reloj, notificaciones,
           pulso grave que se acelera y un riser
  238      un instante de silencio
  240      el corte: impacto + barrido brillante
  240–300  resolución en Fa → Do mayor, más abierta y luminosa

Para el video final, la voz de Alan se mezcla encima con ducking.
"""

import os
import wave

import numpy as np

SR = 48_000
DUR = 10.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(11)
SLICE = 240


def fr(frame):
    return frame / 30.0


def lowpass(x, cutoff):
    """Filtro de un polo; `cutoff` puede ser un número o un array por muestra."""
    cut = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def place(sig, start):
    out = np.zeros(N)
    s = int(start * SR)
    if s >= N:
        return out
    n = min(len(sig), N - s)
    out[s : s + n] = sig[:n]
    return out


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def stereo(x, pan=0.0):
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def wide(x, ms=13):
    d = int(SR * ms / 1000)
    return np.stack([x, np.concatenate([np.zeros(d), x[:-d]])], axis=1)


def reverb(x, wet=0.3):
    y = x.copy()
    for ms, g in [(29, 0.55), (43, 0.47), (61, 0.4), (89, 0.33), (127, 0.26), (173, 0.2), (241, 0.14), (331, 0.09)]:
        d = int(SR * ms / 1000)
        y[d:] += x[:-d] * g
    return x * (1 - wet) + lowpass(y, 4500) * wet


# ================================================================ música
def pad():
    out = np.zeros(N)
    # tensión (La menor con 9na) → resolución luminosa (Fa maj7 → Do add9)
    chords = [
        (0.0, fr(SLICE) - 0.05, [45, 57, 60, 64, 71]),
        (fr(SLICE), fr(SLICE) + 1.0, [41, 53, 57, 60, 64]),
        (fr(SLICE) + 1.0, DUR, [48, 55, 60, 64, 67, 74]),
    ]
    for start, end, notes in chords:
        gate = np.clip((t - start) / 0.25, 0, 1) * np.clip((end + 0.05 - t) / 0.15, 0, 1)
        for m in notes:
            for det in (-0.08, 0.0, 0.07):
                saw = 2 * ((t * midi(m + det) + hash_phase(m, det)) % 1.0) - 1
                out += saw * gate * 0.032
    # el filtro se abre de a poco con la tensión y de golpe en la resolución
    cutoff = np.where(t < fr(SLICE), 500 + 900 * (t / fr(SLICE)) ** 2, 2600)
    out = lowpass(lowpass(out, cutoff), cutoff * 1.4)
    duck = 1 - 0.95 * np.exp(-((t - fr(SLICE - 2)) ** 2) / 0.002)  # el silencio previo al corte
    return out * duck


def hash_phase(m, det):
    return (np.sin(m * 12.9898 + det * 78.233) * 43758.5453) % 1.0


def pulse():
    """Pulso grave: corcheas que se aceleran hasta el corte; negras calmas después."""
    out = np.zeros(N)
    k = 0.0
    tt = 0.0
    while tt < fr(SLICE) - 0.1:
        if tt > 1.0:
            e = np.exp(-np.arange(int(0.25 * SR)) / SR / 0.09)
            sig = np.sin(2 * np.pi * midi(33) * np.arange(len(e)) / SR) * e
            out += place(sig * 0.4, tt)
        step = 0.3125 * (1 - 0.55 * (tt / fr(SLICE)) ** 2)  # 96 BPM en corcheas, acelerando
        tt += step
        k += 1
    tt = fr(SLICE) + 0.62
    while tt < DUR:
        e = np.exp(-np.arange(int(0.5 * SR)) / SR / 0.2)
        sig = np.sin(2 * np.pi * midi(36) * np.arange(len(e)) / SR) * e
        out += place(sig * 0.32, tt)
        tt += 0.625
    return out


# ================================================================ efectos
def key_click(gain):
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    hp = noise - lowpass(noise, 1800 + rng.random() * 1500)
    return hp * np.exp(-tt / 0.006) * gain


def impact(gain=1.0, length=2.4):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = 34 + 90 * np.exp(-tt * 14)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.7)
    crack = lowpass(rng.standard_normal(n), 1800) * np.exp(-tt / 0.08)
    return (body + crack * 0.7) * gain


def whoosh(length, gain=0.5, bright=False):
    n = int(length * SR)
    tt = np.linspace(0, 1, n)
    shape = np.sin(np.pi * tt) ** 2
    noise = rng.standard_normal(n)
    cutoff = 400 + 5000 * tt if bright else 300 + 2200 * np.sin(np.pi * tt)
    return lowpass(noise, cutoff) * shape * gain * (2.2 if bright else 1.6)


def ping(f0, gain=0.2, length=0.35):
    n = int(length * SR)
    tt = np.arange(n) / SR
    sig = np.sin(2 * np.pi * f0 * tt) * np.exp(-tt / 0.06)
    sig += np.sin(2 * np.pi * f0 * 1.5 * tt) * np.exp(-np.maximum(tt - 0.06, 0) / 0.08) * (tt > 0.06)
    return sig * gain


def glitch(gain=0.12):
    n = int(0.09 * SR)
    tt = np.arange(n) / SR
    sq = np.sign(np.sin(2 * np.pi * (180 + rng.random() * 400) * tt))
    gate = (np.floor(tt * 120) % 2 == 0).astype(float)
    return sq * gate * np.exp(-tt / 0.04) * gain


def tick(f0=3200, gain=0.12):
    n = int(0.05 * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * tt) + rng.standard_normal(n) * 0.3) * np.exp(-tt / 0.008) * gain


def riser(length, gain=0.25):
    n = int(length * SR)
    tt = np.arange(n) / SR
    x = tt / length
    tone = np.sin(2 * np.pi * np.cumsum(220 * (1 + 4 * x**2)) / SR)
    noise = rng.standard_normal(n)
    noise = lowpass(noise, 300 + 7000 * x**2)
    return (tone * 0.5 + noise * 1.2) * x**2.5 * gain


def shimmer(length=2.5, gain=0.12):
    n = int(length * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for i, m in enumerate([84, 88, 91, 96]):
        d = int(i * 0.07 * SR)
        e = np.exp(-tt / 0.6)
        out[d:] += (np.sin(2 * np.pi * midi(m) * tt) * e)[: n - d]
    return out * gain


mix = np.zeros((N, 2))
mix += wide(pad())
mix += stereo(pulse())

# ---- 0–96: el gancho
mix += stereo(place(impact(0.85), 0), 0)
f = 6.0
while f < 100:  # tipeo que se acelera, como la carga de la planilla
    mix += stereo(place(key_click(0.13 + rng.random() * 0.05), fr(f)), (rng.random() - 0.5) * 0.4)
    f += max(1.6, 4.5 - f / 30)

# ---- 96–240: el caos
mix += wide(reverb(place(whoosh(0.7, 0.35), fr(94))))
for k in range(5):  # errores en la planilla
    mix += stereo(reverb(place(glitch(), fr(104 + k * 5))), -0.2 + 0.1 * k)
mix += wide(reverb(place(whoosh(0.8, 0.3), fr(145))))
for i in range(12):  # mensajes que llegan
    at = 100 + round(18 * i - 0.6 * i * i)
    if at > 140:
        mix += stereo(reverb(place(ping(1180 + (i % 3) * 120, 0.09), fr(at)), 0.35), 0.5)
mix += wide(reverb(place(whoosh(0.8, 0.3), fr(192))))
for k in range(4):  # el reloj de la tarea repetida
    mix += stereo(place(tick(3400 if k % 2 == 0 else 2700), fr(196 + k * 11)), -0.4)
for k, at in enumerate([206, 211, 216, 220, 224, 228]):  # notificaciones
    mix += stereo(reverb(place(ping(760 + k * 70, 0.08, 0.25), fr(at)), 0.4), [-0.6, 0.6][k % 2])
mix += wide(place(riser(fr(SLICE - 202), 0.32), fr(202)))

# ---- 240: el corte
mix += stereo(place(impact(1.0, 3.0), fr(SLICE)), 0)
mix += wide(reverb(place(whoosh(0.5, 0.5, bright=True), fr(SLICE - 6)), 0.4))
mix += wide(reverb(place(shimmer(), fr(SLICE + 2)), 0.5))
mix += wide(reverb(place(ping(1568, 0.05, 0.6), fr(SLICE + 38)), 0.6))  # el logo

fade = np.clip((DUR - t) / 0.5, 0, 1)[:, None]
mix *= fade
mix = np.tanh(mix * 1.2)
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))

out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
os.makedirs(out_dir, exist_ok=True)
path = os.path.join(out_dir, "apertura-sonido.wav")
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok:", os.path.normpath(path))
