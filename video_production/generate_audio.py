"""
Step 3 – Generate a royalty-free background music track with numpy.

Produces a WAV file: clients/<CLIENT_ID>/audio/background.wav

Instruments:
  - Kick drum (punchy sine + noise transient)
  - Hi-hat (shaped white noise)
  - Shaker (quiet hi-freq noise bursts)
  - Clap / snare (noise burst + short verb tail)
  - Bass (sine pentatonic, A-minor)

Usage:
    python generate_audio.py --duration 47
    python generate_audio.py --client autre_client --duration 32
"""

import argparse
import struct
import sys
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
import config as cfg


SR   = 44100          # sample rate
BITS = 16
MAX  = 2 ** (BITS - 1) - 1


# ─── Synthesis helpers ────────────────────────────────────────────────────────

def _sine(freq: float, dur: float, amp: float = 1.0) -> np.ndarray:
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    return amp * np.sin(2 * np.pi * freq * t)


def _env(n: int, attack: float = 0.002, decay: float = 0.15) -> np.ndarray:
    """Percussive AR envelope (samples)."""
    a_n = int(attack * SR)
    d_n = int(decay  * SR)
    e   = np.zeros(n)
    if a_n > 0:
        e[:a_n] = np.linspace(0, 1, a_n)
    tail = min(d_n, n - a_n)
    if tail > 0:
        e[a_n:a_n + tail] = np.exp(-np.linspace(0, 8, tail))
    return e


def _kick(dur: float = 0.45) -> np.ndarray:
    n   = int(SR * dur)
    t   = np.linspace(0, dur, n, endpoint=False)
    # Pitch sweep 150 Hz → 50 Hz
    freq = 150 * np.exp(-8 * t)
    sig  = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    sig += 0.15 * np.random.randn(n) * np.exp(-50 * t)  # click transient
    return sig * _env(n, 0.001, 0.3)


def _hat(dur: float = 0.06, amp: float = 0.35) -> np.ndarray:
    n   = int(SR * dur)
    sig = np.random.randn(n)
    # High-pass via crude difference
    sig = np.diff(np.concatenate([[0], sig]))
    return sig[:n] * _env(n, 0.001, 0.04) * amp


def _shaker(dur: float = 0.04, amp: float = 0.18) -> np.ndarray:
    n   = int(SR * dur)
    sig = np.random.randn(n)
    sig = np.diff(np.concatenate([[0], sig]))
    return sig[:n] * _env(n, 0.001, 0.025) * amp


def _clap(dur: float = 0.18, amp: float = 0.55) -> np.ndarray:
    n   = int(SR * dur)
    sig = np.random.randn(n)
    env = _env(n, 0.001, 0.12)
    # Short reverb tail (simple comb)
    out = sig * env
    delay = int(0.02 * SR)
    for i in range(delay, n):
        out[i] += 0.3 * out[i - delay]
    return out * amp


def _bass_note(freq: float, dur: float, amp: float = 0.55) -> np.ndarray:
    n   = int(SR * dur)
    t   = np.linspace(0, dur, n, endpoint=False)
    sig = np.sin(2 * np.pi * freq * t)
    sig += 0.3 * np.sin(2 * np.pi * 2 * freq * t)   # harmonic
    env = np.exp(-2.5 * t)
    return sig * env * amp


# ─── Pattern builder ──────────────────────────────────────────────────────────

# A-minor pentatonic bass notes (Hz) for one bar (4 beats)
_BASS_PATTERN = [110.0, 110.0, 146.83, 130.81,   # A2 A2 D3 C3
                 110.0, 110.0, 130.81, 146.83]     # A2 A2 C3 D3


def _build_bar(bpm: int, beat_samples: int) -> np.ndarray:
    """Build one 4-beat bar as a numpy array."""
    bar    = np.zeros(beat_samples * 4)
    half_b = beat_samples // 2      # 8th note
    qtr_b  = beat_samples // 4      # 16th note

    def _place(sound: np.ndarray, offset: int) -> None:
        end = min(offset + len(sound), len(bar))
        bar[offset:end] += sound[:end - offset]

    for b in range(4):
        pos = b * beat_samples
        _place(_kick(),   pos if b in (0, 2) else -1 if False else pos if b in (0, 2) else 0)

    # Redo kick: beats 0 and 2
    bar[:] = 0
    for b in (0, 2):
        _place(_kick(), b * beat_samples)

    # Clap / snare: beats 1 and 3
    for b in (1, 3):
        _place(_clap(), b * beat_samples)

    # Hi-hat: every 8th note
    for i in range(8):
        _place(_hat(), i * half_b)

    # Shaker: every 16th note
    for i in range(16):
        _place(_shaker(), i * qtr_b)

    # Bass: 8 notes per bar
    for i, freq in enumerate(_BASS_PATTERN):
        dur = (beat_samples / SR) * 0.9
        _place(_bass_note(freq, dur), i * half_b)

    return bar


def generate_audio(duration: float, client_id: str = cfg.CLIENT_ID) -> Path:
    out_dir = Path(__file__).parent / "clients" / client_id / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "background.wav"

    bpm          = cfg.AUDIO_BPM
    total_dur    = duration + cfg.AUDIO_EXTRA_SEC
    beat_samples = int(SR * 60.0 / bpm)
    bar_samples  = beat_samples * 4
    total_samples = int(SR * total_dur)

    track = np.zeros(total_samples)
    bar   = _build_bar(bpm, beat_samples)

    for start in range(0, total_samples, bar_samples):
        end = min(start + bar_samples, total_samples)
        track[start:end] += bar[:end - start]

    # Normalize + fade out 2 s
    peak = np.max(np.abs(track)) or 1.0
    track /= peak
    fade_n = int(SR * 2.0)
    if fade_n < total_samples:
        track[-fade_n:] *= np.linspace(1.0, 0.0, fade_n)

    # Write WAV
    pcm = np.clip(track * 0.85 * MAX, -MAX, MAX).astype(np.int16)
    with wave.open(str(out_path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())

    print(f"[generate_audio] {total_dur:.1f}s track at {bpm} BPM → {out_path}")
    return out_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate background music")
    parser.add_argument("--client",   default=cfg.CLIENT_ID)
    parser.add_argument("--duration", type=float, default=45.0,
                        help="Target video duration in seconds")
    args = parser.parse_args()
    generate_audio(args.duration, args.client)
