#!/usr/bin/env python3
"""Pista guía del spot de 15 s: música sintetizada a 120 BPM y efectos sincronizados
con la animática (ver la tabla de sonido de GUION.md).

Es una referencia de ritmo para edición, no la banda sonora final: sustitúyela por
música con licencia y la locución grabada.

Uso:  python3 marketing/video-15s/pista-guia.py   → marketing/video-15s/pista-guia.wav
Requiere numpy. Si hay ffmpeg en el PATH, normaliza a −14 LUFS / −1 dBTP.
Después, render.mjs la incorpora al MP4 automáticamente.
"""
import json
import math
import os
import shutil
import subprocess
import sys
import wave

import numpy as np

SR = 48000
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(2026)
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "pista-guia.wav")


# ---------- Utilidades de síntesis ----------
def tv(d):
    return np.arange(int(round(d * SR))) / SR


def fade(sig, a=0.003, r=0.01):
    n = len(sig)
    env = np.ones(n)
    ai, ri = min(n, int(a * SR)), min(n, int(r * SR))
    if ai:
        env[:ai] = np.linspace(0, 1, ai)
    if ri:
        env[n - ri:] *= np.linspace(1, 0, ri)
    return sig * env


def osc(freq, d):
    n = int(round(d * SR))
    f = np.full(n, float(freq)) if np.ndim(freq) == 0 else np.asarray(freq, float)[:n]
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def glide(f0, f1, d, tg):
    k = np.clip(tv(d) / tg, 0, 1)
    return f0 * (f1 / f0) ** k


def lowpass(x, fc):
    fcs = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = (1 - np.exp(-2 * np.pi * fcs / SR)).tolist()
    s, out = 0.0, []
    for xi, ai in zip(x.tolist(), a):
        s += ai * (xi - s)
        out.append(s)
    return np.array(out)


def bandpass(x, fc, damp=0.7):
    """Filtro de estado variable (Chamberlin); fc puede variar por muestra."""
    fcs = np.broadcast_to(np.asarray(fc, float), x.shape).tolist()
    low = band = 0.0
    out = []
    for xi, f in zip(x.tolist(), fcs):
        F = 2 * math.sin(math.pi * min(f, SR / 7) / SR)
        high = xi - low - damp * band
        band += F * high
        low += F * band
        out.append(band)
    return np.array(out)


# ---------- Instrumentos ----------
def kick(gain=1.0):
    d = 0.45
    s = osc(glide(170, 56, d, 0.06), d) * np.exp(-tv(d) / 0.14)
    return fade(np.tanh(1.4 * s), 0.0008, 0.03) * gain


def hat(gain=1.0):
    d = 0.06
    n = rng.standard_normal(int(d * SR))
    n = np.diff(np.diff(n, prepend=0), prepend=0) / 4
    return fade(lowpass(n, 9000) * np.exp(-tv(d) / 0.018), 0.0008, 0.006) * gain


def clap(gain=1.0):
    d = 0.3
    t = tv(d)
    env = 0.8 * np.exp(-t / 0.09)
    for off in (0.0, 0.011, 0.022):
        env += np.where(t >= off, np.exp(-np.clip(t - off, 0, None) / 0.004), 0)
    return fade(bandpass(rng.standard_normal(len(t)), 1400.0, 0.9) * env * 0.4, 0.0008, 0.03) * gain


def pluck(freq, gain=1.0, d=0.7, tau=0.22):
    t = tv(d)
    s = np.zeros_like(t)
    for k in range(1, 11):
        if freq * k > 11000:
            break
        s += np.sin(2 * np.pi * freq * k * t) * k ** -1.05 * np.exp(-t / (tau / k ** 0.5))
    return fade(s * 0.55, 0.002, 0.06) * gain


def bell(freq, gain=1.0, d=1.8, tau=0.9):
    t = tv(d)
    s = np.zeros_like(t)
    for ratio, amp, tk in ((1, 1, 1), (2.0, 0.4, 0.6), (2.76, 0.3, 0.45), (5.4, 0.15, 0.25), (8.93, 0.08, 0.15)):
        if freq * ratio < 15000:
            s += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / (tau * tk))
    return fade(s * 0.35, 0.001, 0.15) * gain


def bass(freq, gain=1.0, d=0.45, tau=0.24):
    t = tv(d)
    s = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * 2 * freq * t) + 0.2 * np.sin(2 * np.pi * 3 * freq * t)
    return fade(np.tanh(1.5 * s) * np.exp(-t / tau) * 0.8, 0.005, 0.04) * gain


def pad_chord(freqs, d, attack=0.08, release=0.5, seed=0):
    t = tv(d)
    r = np.random.default_rng(seed)
    out = np.zeros((2, len(t)))
    for ch in range(2):
        for f0 in freqs:
            for cents in (-8, 0, 8):
                f = f0 * 2 ** ((cents + (3 if ch else -3)) / 1200)
                for k in range(1, 20):
                    if f * k > 7000:
                        break
                    out[ch] += np.sin(2 * np.pi * f * k * t + r.uniform(0, 2 * np.pi)) / k
    env = np.minimum(1, t / attack) * np.clip((d - t) / release, 0, 1)
    return out * env / (3 * len(freqs))


def sweep(d, f0, f1, damp=0.6, power=1.0, gain=1.0):
    t = tv(d)
    y = bandpass(rng.standard_normal(len(t)), f0 * (f1 / f0) ** (t / d), damp)
    env = np.sin(np.pi * t / d) if power is None else (t / d) ** power
    return fade(y * env * 0.5, 0.005, 0.02) * gain


def glitch(d=0.17, gain=1.0):
    n = int(d * SR)
    out = np.zeros(n)
    i = 0
    while i < n:
        seg = int(rng.uniform(0.008, 0.03) * SR)
        tt = np.arange(seg) / SR
        kind = rng.integers(0, 3)
        if kind == 0:
            s = np.sign(np.sin(2 * np.pi * rng.uniform(200, 1800) * tt)) * 0.35
        elif kind == 1:
            s = np.repeat(rng.uniform(-1, 1, seg // 24 + 1), 24)[:seg] * 0.4
        else:
            s = rng.standard_normal(seg) * 0.25
        out[i:i + seg] = s[: n - i]
        i += seg
    return fade(lowpass(out, 6000), 0.002, 0.01) * gain


def buzz(d=0.3, gain=1.0):
    t = tv(d)
    s = np.sign(np.sin(2 * np.pi * 110 * t)) + np.sign(np.sin(2 * np.pi * 116.5 * t))
    return fade(lowpass(s * 0.3, 1500) * np.clip((d - t) / 0.08, 0, 1), 0.005, 0.03) * gain


def stamp_hit(gain=1.0):
    """Logo sonoro: golpe de madera + sub-grave + palmada de papel."""
    d = 1.6
    t = tv(d)
    boom = np.tanh(1.6 * osc(glide(110, 40, d, 0.18), d) * np.exp(-t / 0.38)) * 0.9
    knock = (np.sin(2 * np.pi * 420 * t) * np.exp(-t / 0.03) + 0.6 * np.sin(2 * np.pi * 960 * t) * np.exp(-t / 0.02)) * 0.45
    m = int(0.04 * SR)
    slap = np.zeros_like(t)
    slap[:m] = bandpass(rng.standard_normal(m), 2500.0, 0.8) * np.exp(-np.arange(m) / SR / 0.012) * 0.5
    m2 = int(0.012 * SR)
    tick = np.zeros_like(t)
    tick[:m2] = bandpass(rng.standard_normal(m2), 4200.0, 0.5) * np.exp(-np.arange(m2) / SR / 0.004) * 0.35
    return fade(boom + knock + slap + tick, 0.0008, 0.1) * gain


def blip(f0, f1, d, tau, gain=1.0):
    return fade(osc(glide(f0, f1, d, d), d) * np.exp(-tv(d) / tau), 0.001, 0.01) * gain


# ---------- Mezcla ----------
music = np.zeros((2, N))
sfx = np.zeros((2, N))


def place(bus, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N:
        return
    sig = np.atleast_2d(sig)
    if sig.shape[0] == 1:
        l, r = math.cos((pan + 1) * math.pi / 4) * math.sqrt(2), math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)
        sig = np.vstack([sig[0] * l, sig[0] * r])
    j = min(N, i + sig.shape[1])
    bus[:, i:j] += sig[:, : j - i] * gain


# Acto 1–2 (0–4 s): tensión filtrada
t = tv(4.0)
drone = 0.3 * np.sin(2 * np.pi * 73.42 * t) + 0.35 * np.sin(2 * np.pi * 110.0 * t)
drone += lowpass(sum(np.sin(2 * np.pi * 146.83 * k * t) / k for k in range(1, 10)) * 0.25, 380)
drone *= (0.8 + 0.2 * np.sin(2 * np.pi * 2 * t)) * np.minimum(1, t / 0.6)
place(music, fade(drone * 0.38, 0.01, 0.012), 0.0)
for k in range(16):
    place(music, hat(0.26 if k % 2 == 0 else 0.16), k * 0.25, pan=0.3)
for s in (0.0, 1.0, 2.0, 3.0):
    place(music, lowpass(kick(0.45), 900), s)
place(sfx, hat(0.9), 0.98, pan=0.1)
place(sfx, hat(0.7), 1.04, pan=0.1)
place(sfx, glitch(gain=0.6), 1.1)
place(sfx, sweep(0.4, 600, 2600, power=None, gain=0.35), 1.95)
place(sfx, sweep(1.0, 300, 7000, power=2.0, gain=0.6), 3.0)
place(sfx, fade(osc(glide(220, 880, 1.0, 1.0), 1.0) * tv(1.0) * 0.08, 0.01, 0.01), 3.0)

# Impacto (4,0 s): el golpe del sello + brillo
place(sfx, stamp_hit(1.0), 4.0)
place(sfx, bell(880, 0.35), 4.02, pan=-0.3)
place(sfx, bell(1318.5, 0.3), 4.05, pan=0.3)

# Actos 3–5 (4–12 s): progresión D – A – Bm – G
chords = [
    (4.0, [146.83, 185.00, 220.00], 73.42, [293.66, 369.99, 440.00, 587.33]),
    (6.0, [220.00, 277.18, 329.63], 110.00, [329.63, 440.00, 554.37, 659.26]),
    (8.0, [246.94, 293.66, 369.99], 123.47, [369.99, 493.88, 587.33, 739.99]),
    (10.0, [196.00, 246.94, 293.66], 98.00, [293.66, 392.00, 493.88, 587.33]),
]
pad = np.zeros((2, N))
kicks = []
for i, (start, triad, root, arp) in enumerate(chords):
    place(pad, pad_chord(triad, 2.2, seed=i), start)
    for b in range(4):
        tb = start + b * 0.5
        if tb != 4.0 and not 9.45 <= tb < 10.0:
            place(music, kick(0.75), tb)
            kicks.append(tb)
        if not 9.45 <= tb < 10.0:
            place(music, bass(root, 0.42), tb)
        if b in (1, 3) and not 9.45 <= tb < 10.0:
            place(music, clap(0.55), tb, pan=-0.1)
        place(music, hat(0.42), tb + 0.25, pan=0.35)
        for q in (0.125, 0.375):
            place(music, hat(0.14), tb + q, pan=-0.35)
    for e, idx in enumerate((0, 1, 2, 3, 2, 1, 2, 3)):
        te = start + e * 0.25
        if te > 4.1:
            place(music, pluck(arp[idx], 0.32 * (0.85 + 0.3 * rng.random())), te, pan=0.25 if e % 2 else -0.25)

# Cierre (12–15 s): resolución en D sin batería
place(pad, pad_chord([146.83, 185.00, 220.00, 293.66], 3.0, attack=0.05, release=1.2, seed=9), 12.0)
place(music, bass(73.42, 0.6, d=2.5, tau=0.9), 12.0)
for k, f in enumerate((587.33, 440.00, 369.99, 293.66)):
    place(music, pluck(f, 0.22, d=1.0, tau=0.35), 12.5 + k * 0.5, pan=0.2 if k % 2 else -0.2)
place(music, kick(0.5), 12.0)
kicks.append(12.0)

# Bombeo del pad desde el bombo
tt = np.arange(N) / SR
duck = np.ones(N)
for tk in kicks + [4.0]:
    m = tt >= tk
    duck[m] = np.minimum(duck[m], 1 - 0.45 * np.exp(-(tt[m] - tk) / 0.12))
music += pad * 0.9 * duck

# Efectos del producto
place(sfx, blip(140, 60, 0.25, 0.07, 0.5), 5.56)
place(sfx, sweep(0.05, 2500, 3500, power=None, gain=0.25), 5.56)
place(sfx, sweep(0.9, 800, 3000, power=None, gain=0.16), 6.05)
for k in range(18):
    place(sfx, blip(4000 + 400 * rng.random(), 4000, 0.006, 0.003, 0.06), 6.1 + k * 0.047, pan=rng.uniform(-0.4, 0.4))
place(sfx, blip(1000, 520, 0.18, 0.05, 0.45), 7.0)
place(sfx, bell(2093, 0.15, d=0.6, tau=0.25), 7.0)
place(sfx, sweep(0.012, 2000, 2200, power=None, gain=0.5), 8.0)
place(sfx, sweep(0.3, 800, 5000, power=None, gain=0.25), 8.02)
place(sfx, blip(1760, 1760, 0.12, 0.06, 0.2), 8.12)
place(sfx, blip(2349, 2349, 0.12, 0.06, 0.2), 8.18)
place(sfx, sweep(0.35, 3000, 600, power=None, gain=0.3), 9.0)
place(sfx, glitch(gain=0.55), 9.5)
place(sfx, buzz(gain=0.45), 9.8)
place(sfx, bell(1174.66, 0.3), 10.0, pan=-0.2)
place(sfx, bell(1760.0, 0.28), 10.08, pan=0.2)
place(sfx, sweep(0.5, 4000, 500, power=None, gain=0.32), 11.55)
place(sfx, bell(587.33, 0.25), 12.0, pan=-0.2)
place(sfx, bell(880.0, 0.22), 12.04, pan=0.2)
place(sfx, stamp_hit(0.55), 14.0)
place(sfx, bell(880, 0.22), 14.02, pan=-0.3)
place(sfx, bell(1318.5, 0.2), 14.05, pan=0.3)

# Caída del filtro mientras se manipula la copia (9,45–10,05 s)
fc = np.full(N, 16000.0)
seg = (tt >= 9.45) & (tt < 10.05)
x = (tt[seg] - 9.45) / 0.6
fc[seg] = 16000 * (500 / 16000) ** np.clip(np.minimum(x / 0.17, (1 - x) / 0.17), 0, 1)
i0, i1 = int(9.4 * SR), int(10.1 * SR)
for ch in range(2):
    music[ch, i0:i1] = lowpass(music[ch, i0:i1], fc[i0:i1])

mix = music * 0.8 + sfx
for _ in range(2):  # sin DC ni subgraves que un móvil no reproduce
    mix -= np.vstack([lowpass(mix[0], 38), lowpass(mix[1], 38)])
mix += 0.9 * (mix - np.vstack([lowpass(mix[0], 2500), lowpass(mix[1], 2500)]))  # brillo
mix = np.tanh(mix * 1.1) / 1.1
tail = int(0.3 * SR)
mix[:, N - tail:] *= np.linspace(1, 0, tail) ** 2  # final limpio para el bucle
mix *= 0.89 / np.max(np.abs(mix))


def write_wav(path, data):
    pcm = (np.clip(data.T, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if shutil.which("ffmpeg"):
    raw = OUT + ".raw.wav"
    write_wav(raw, mix)
    probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    m = json.loads(probe[probe.rindex("{"):probe.rindex("}") + 1])
    af = ("loudnorm=I=-14:TP=-1:LRA=11:linear=true:"
          f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
          f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-af", af, "-ar", str(SR), OUT], check=True)
    os.remove(raw)
else:
    write_wav(OUT, mix)
print(f"OK → {OUT}")
