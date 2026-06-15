"""
Build script spécifique : Restaurant Occidental — Compilation complète
======================================================================
Utilise les 5 vidéos uploadées + cartes texte générées par PIL
Produit 3 formats :
  output/restaurant_occidental/main_45s.mp4
  output/restaurant_occidental/b2b_30s.mp4
  output/restaurant_occidental/whatsapp_15s.mp4
"""

import os
import subprocess
import sys
import time
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

# ─── Paths ───────────────────────────────────────────────────────────────────
HERE      = Path(__file__).parent
OUT_DIR   = HERE / "output" / "restaurant_occidental"
TMP       = HERE / "_build_tmp"
FONTS_DIR = HERE
UPLOAD_DIR = Path("/root/.claude/uploads/e50af339-f551-55c0-95c3-18e424faf9e7")

OUT_DIR.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)

# ─── Brand ────────────────────────────────────────────────────────────────────
W, H        = 1080, 1920          # output resolution
FPS         = 30
C_PRIMARY   = (15,  76,  140)     # bleu profond
C_ACCENT    = (244, 180,  54)     # or
C_DARK      = (8,   40,   80)     # bleu foncé
C_LIGHT     = (235, 235, 235)
C_DARK_TXT  = (20,  20,   20)
TRANSITION  = 0.40                # secondes

# Video sources (ordered by visual impact)
VIDEOS = sorted(UPLOAD_DIR.glob("*.mp4"))
# Manual order: façade, salle/couple, terrasse, poisson, pouce levé
VORDER = [
    "052f01e7-video1232323486620234.mp4",   # 0 - façade extérieure
    "7aff9dd9-video1232327836619799.mp4",   # 1 - terrasse + serveur
    "a72751a2-video1232334153285834.mp4",   # 2 - poisson grillé
    "7504afb3-video1232332549952661.mp4",   # 3 - salle intérieure couple
    "ddea8fb3-video1232335649952351.mp4",   # 4 - client pouce levé
]
VSRC = [UPLOAD_DIR / n for n in VORDER]


# ─── Font helper ─────────────────────────────────────────────────────────────

def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(str(FONTS_DIR / name), size)
    except Exception:
        return ImageFont.load_default()


# ─── Card renderer ────────────────────────────────────────────────────────────

def gradient(w: int, h: int, c1=C_PRIMARY, c2=C_DARK) -> Image.Image:
    img = Image.new("RGB", (w, h))
    dr  = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        dr.line([(0, y), (w, y)], fill=(r, g, b))
    return img


def center_text(draw, text, fnt, y, color):
    bb  = draw.textbbox((0, 0), text, font=fnt)
    tw  = bb[2] - bb[0]
    th  = bb[3] - bb[1]
    draw.text(((W - tw) / 2, y), text, font=fnt, fill=color)
    return y + th


def make_card(
    title: str, subtitle: str, body_lines: list[str],
    cta: str | None = None,
    logo: bool = False,
) -> Image.Image:
    img  = gradient(W, H)

    # Subtle radial golden glow top-centre using alpha_composite
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdr = ImageDraw.Draw(glow_layer, "RGBA")
    cx, cy_g = W // 2, H // 4
    for i in range(8, 0, -1):
        a   = int(22 * (i / 8))
        rad = 480 * i // 8
        gdr.ellipse([cx - rad, cy_g - rad, cx + rad, cy_g + rad],
                    fill=(*C_ACCENT, a))
    img = Image.alpha_composite(img.convert("RGBA"), glow_layer).convert("RGB")
    draw = ImageDraw.Draw(img)

    f_big  = font("Poppins-Bold.ttf",     96)
    f_sub  = font("Poppins-SemiBold.ttf", 54)
    f_body = font("Poppins-Regular.ttf",  50)
    f_cta  = font("Poppins-SemiBold.ttf", 52)

    y = H // 6

    # Title (word-wrap at ~15 chars)
    words, lines, cur = title.split(), [], ""
    for w_word in words:
        if len(cur) + len(w_word) + 1 > 15 and cur:
            lines.append(cur.strip())
            cur = w_word + " "
        else:
            cur += w_word + " "
    if cur:
        lines.append(cur.strip())

    for line in lines:
        y = center_text(draw, line, f_big, y, C_ACCENT) + 6
    y += 10

    # Gold underline
    lw = min(420, W // 2)
    draw.rectangle([(W - lw) // 2, y, (W + lw) // 2, y + 5], fill=C_ACCENT)
    y += 28

    # Subtitle
    if subtitle:
        y = center_text(draw, subtitle, f_sub, y, C_LIGHT) + 22

    # Thin separator
    draw.line([(W // 4, y), (3 * W // 4, y)], fill=(*C_ACCENT, 100), width=2)
    y += 30

    # Body lines
    for line in body_lines:
        y = center_text(draw, line, f_body, y, C_LIGHT) + 18
    y += 10

    # CTA button
    if cta:
        bx, bw_btn, bh = 80, W - 160, 115
        by = H - 270
        # Shadow
        draw.rounded_rectangle(
            [bx + 6, by + 6, bx + bw_btn + 6, by + bh + 6],
            radius=58, fill=(0, 0, 0, 90),
        )
        draw.rounded_rectangle(
            [bx, by, bx + bw_btn, by + bh],
            radius=58, fill=C_ACCENT,
        )
        center_text(draw, cta, f_cta, by + 30, C_DARK_TXT)

    return img


# ─── Card definitions ─────────────────────────────────────────────────────────

CARDS_DEF = [
    {   # 0 — Titre
        "file": "card_00_title.png",
        "kwargs": dict(
            title="RESTAURANT OCCIDENTAL",
            subtitle="Boké, Guinée",
            body_lines=["La bonne cuisine tout près de chez vous"],
        ),
        "dur": 4.5,
    },
    {   # 1 — Services
        "file": "card_01_services.png",
        "kwargs": dict(
            title="NOS SPÉCIALITÉS",
            subtitle="Cuisine africaine & internationale",
            body_lines=[
                "Poisson grillé · Poulet braisé",
                "Brochettes · Riz sauce",
                "Plats du jour à prix doux",
            ],
        ),
        "dur": 4.0,
    },
    {   # 2 — Traiteur
        "file": "card_02_traiteur.png",
        "kwargs": dict(
            title="AUSSI TRAITEUR",
            subtitle="Événements sur mesure",
            body_lines=[
                "Mariages · Cérémonies",
                "Anniversaires · Réceptions d'entreprises",
            ],
        ),
        "dur": 4.0,
    },
    {   # 3 — Pourquoi nous
        "file": "card_03_pourquoi.png",
        "kwargs": dict(
            title="POURQUOI NOUS ?",
            subtitle="",
            body_lines=[
                "✔  Ingrédients frais chaque jour",
                "✔  Service rapide & chaleureux",
                "✔  Cadre propre & climatisé",
                "✔  Prix accessibles à tous",
            ],
        ),
        "dur": 4.0,
    },
    {   # 4 — CTA
        "file": "card_04_cta.png",
        "kwargs": dict(
            title="RÉSERVEZ VOTRE TABLE",
            subtitle="Une minute suffit",
            body_lines=["WhatsApp : 610 32 11 72"],
            cta="📲  Appeler / WhatsApp",
        ),
        "dur": 5.5,
    },
]


def build_cards() -> dict[str, Path]:
    paths = {}
    for cd in CARDS_DEF:
        dest = TMP / cd["file"]
        img  = make_card(**cd["kwargs"])
        img.save(dest, "PNG")
        paths[cd["file"]] = dest
        print(f"  ✔ {cd['file']}")
    return paths


# ─── Audio ────────────────────────────────────────────────────────────────────

SR   = 44100
MAX  = 32767

def _env(n, attack=0.002, decay=0.15):
    a_n = int(attack * SR)
    d_n = int(decay  * SR)
    e   = np.zeros(n)
    if a_n:
        e[:a_n] = np.linspace(0, 1, a_n)
    tail = min(d_n, n - a_n)
    if tail:
        e[a_n:a_n + tail] = np.exp(-np.linspace(0, 8, tail))
    return e

def _kick(dur=0.45):
    n = int(SR * dur)
    t = np.linspace(0, dur, n, endpoint=False)
    f = 150 * np.exp(-8 * t)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s += 0.15 * np.random.randn(n) * np.exp(-50 * t)
    return s * _env(n, 0.001, 0.3)

def _hat(dur=0.06, amp=0.30):
    n = int(SR * dur)
    s = np.random.randn(n)
    s = np.diff(np.concatenate([[0], s]))
    return s[:n] * _env(n, 0.001, 0.04) * amp

def _clap(dur=0.18, amp=0.50):
    n   = int(SR * dur)
    s   = np.random.randn(n) * _env(n, 0.001, 0.12)
    d   = int(0.02 * SR)
    for i in range(d, n):
        s[i] += 0.3 * s[i - d]
    return s * amp

def _shaker(dur=0.04, amp=0.15):
    n = int(SR * dur)
    s = np.random.randn(n)
    s = np.diff(np.concatenate([[0], s]))
    return s[:n] * _env(n, 0.001, 0.025) * amp

def _bass(freq, dur, amp=0.52):
    n = int(SR * dur)
    t = np.linspace(0, dur, n, endpoint=False)
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * 2 * freq * t)
    return s * np.exp(-2.5 * t) * amp

_BASS_NOTES = [110.0, 110.0, 146.83, 130.81, 110.0, 110.0, 130.81, 146.83]

def _bar(bpm=104):
    bs   = int(SR * 60.0 / bpm)
    bar  = np.zeros(bs * 4)
    half = bs // 2
    qtr  = bs // 4

    def place(sig, off):
        end = min(off + len(sig), len(bar))
        bar[off:end] += sig[:end - off]

    for b in (0, 2):
        place(_kick(), b * bs)
    for b in (1, 3):
        place(_clap(), b * bs)
    for i in range(8):
        place(_hat(), i * half)
    for i in range(16):
        place(_shaker(), i * qtr)
    for i, f in enumerate(_BASS_NOTES):
        place(_bass(f, (bs / SR) * 0.9), i * half)
    return bar

def generate_audio(duration: float, bpm: int = 104) -> Path:
    total     = int(SR * (duration + 2.0))
    bar       = _bar(bpm)
    bar_n     = len(bar)
    track     = np.zeros(total)
    for start in range(0, total, bar_n):
        end = min(start + bar_n, total)
        track[start:end] += bar[:end - start]
    peak = np.max(np.abs(track)) or 1.0
    track /= peak
    fade_n = int(SR * 2.0)
    track[-fade_n:] *= np.linspace(1.0, 0.0, fade_n)
    pcm = np.clip(track * 0.82 * MAX, -MAX, MAX).astype(np.int16)
    out = TMP / "music.wav"
    with wave.open(str(out), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())
    print(f"  ✔ music.wav  ({duration:.1f}s track, {bpm} BPM)")
    return out


# ─── FFmpeg helpers ───────────────────────────────────────────────────────────

def run(cmd: list, label: str):
    print(f"  [ffmpeg] {label}")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-3000:])
        raise RuntimeError(f"FFmpeg error: {label}")


def card_to_clip(png: Path, dur: float, out: Path):
    """Static card → Ken-Burns clip."""
    n_frames = int(dur * FPS)
    vf = (
        f"zoompan=z='1+0.0005*on':d={n_frames}:s={W}x{H}:fps={FPS}"
        f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',"
        "format=yuv420p"
    )
    run(
        ["ffmpeg", "-y", "-loop", "1", "-i", str(png),
         "-t", str(dur), "-vf", vf,
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", str(out)],
        f"card → clip  {png.name} ({dur}s)",
    )


# Per-video delogo zones (source resolution 464×832)
# The "☼ Meta AI" badge sits in the upper-right; position varies per clip.
_WM_ZONE = {
    "052f01e7": "delogo=x=313:y=218:w=148:h=38",  # façade — tight, avoids wall sign text
    "7504afb3": "delogo=x=278:y=210:w=183:h=40",  # salle couple
    "7aff9dd9": "delogo=x=278:y=148:w=183:h=40",  # terrasse + serveur
    "a72751a2": "delogo=x=313:y=205:w=148:h=35",  # poisson grillé
    "ddea8fb3": "delogo=x=270:y=210:w=188:h=40",  # pouce levé
}


def video_to_clip(src: Path, dur: float, out: Path):
    """Scale uploaded video to 1080×1920, remove Meta AI watermark, force 30fps."""
    prefix  = src.name[:8]
    delogo  = _WM_ZONE.get(prefix, "delogo=x=270:y=140:w=195:h=140")
    vf = (
        f"{delogo},"
        f"scale={W}:{H}:force_original_aspect_ratio=increase,"
        f"crop={W}:{H},"
        f"fps={FPS},"
        "format=yuv420p"
    )
    run(
        ["ffmpeg", "-y", "-i", str(src),
         "-t", str(dur),
         "-vf", vf,
         "-r", str(FPS),
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "19",
         "-an", str(out)],
        f"video → clip  {src.name} ({dur}s, watermark removed)",
    )


def xfade_chain(clips: list[tuple[Path, float]], out: Path):
    """xfade-chain N clips → single video."""
    td = TRANSITION
    if len(clips) == 1:
        run(["ffmpeg", "-y", "-i", str(clips[0][0]),
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", str(out)],
            f"single clip → {out.name}")
        return

    inputs = []
    for c, _ in clips:
        inputs += ["-i", str(c)]

    filt_parts = []
    offset     = 0.0
    prev       = "[0:v]"

    for i in range(1, len(clips)):
        offset += clips[i - 1][1] - td
        label   = f"[v{i}]" if i < len(clips) - 1 else "[vout]"
        filt_parts.append(
            f"{prev}[{i}:v]xfade=transition=fade"
            f":duration={td}:offset={offset:.4f}{label}"
        )
        prev = label

    run(
        ["ffmpeg", "-y", *inputs,
         "-filter_complex", ";".join(filt_parts),
         "-map", "[vout]",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "19",
         "-pix_fmt", "yuv420p", str(out)],
        f"xfade {len(clips)} clips → {out.name}",
    )


def concat_parts(parts: list[Path], out: Path):
    import tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as fh:
        for p in parts:
            fh.write(f"file '{p.resolve()}'\n")
        lst = Path(fh.name)
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
         "-c", "copy", str(out)], f"concat → {out.name}")
    lst.unlink(missing_ok=True)


def _video_duration(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True,
    )
    return float(r.stdout.strip() or "0")


def mix_audio(video: Path, audio: Path, out: Path):
    dur      = _video_duration(video)
    fade_st  = max(0.0, dur - 2.0)
    run(
        ["ffmpeg", "-y", "-i", str(video), "-i", str(audio),
         "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
         "-filter:a", f"afade=t=out:st={fade_st:.3f}:d=2",
         "-shortest", str(out)],
        f"mix audio → {out.name}",
    )


# ─── Sequence builder ─────────────────────────────────────────────────────────

BLOCK = 4    # clips per xfade block

def compile_sequence(
    sequence: list[tuple[str, float]],    # ("card_xx.png"|"vid_N", dur)
    card_paths: dict[str, Path],
    audio: Path,
    name: str,
):
    print(f"\n── Compiling {name} ({len(sequence)} clips) ─────────────────")
    clip_dir = TMP / name
    clip_dir.mkdir(exist_ok=True)

    clips: list[tuple[Path, float]] = []

    for i, (src_key, dur) in enumerate(sequence):
        clip_out = clip_dir / f"clip_{i:03d}.mp4"
        if src_key.startswith("card_"):
            card_to_clip(card_paths[src_key], dur, clip_out)
        else:
            vid_idx = int(src_key.split("_")[1])
            video_to_clip(VSRC[vid_idx], dur, clip_out)
        clips.append((clip_out, dur))

    # Split into blocks → parts
    parts = []
    for bi, start in enumerate(range(0, len(clips), BLOCK)):
        block   = clips[start:start + BLOCK]
        part    = clip_dir / f"part_{bi:02d}.mp4"
        xfade_chain(block, part)
        parts.append(part)

    muted = clip_dir / "muted.mp4"
    if len(parts) == 1:
        muted = parts[0]
    else:
        concat_parts(parts, muted)

    final = OUT_DIR / f"{name}.mp4"
    mix_audio(muted, audio, final)
    print(f"  ✅  {final}")
    return final


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    t0 = time.time()
    print("\n" + "=" * 62)
    print("  Restaurant Occidental — Maoba Marketing Digital")
    print("=" * 62)

    print("\n── Phase 1 / Génération des cartes ───────────────────────")
    card_paths = build_cards()

    # ── Sequences ──────────────────────────────────────────────────
    #
    # main_45s  : titre → façade → services → terrasse → poisson →
    #             traiteur → salle → pourquoi → pouce → CTA
    #
    main_seq = [
        ("card_00_title.png",     4.5),
        ("vid_0",                 4.5),   # façade
        ("card_01_services.png",  4.0),
        ("vid_2",                 4.5),   # poisson grillé
        ("card_02_traiteur.png",  4.0),
        ("vid_1",                 4.5),   # terrasse + serveur
        ("card_03_pourquoi.png",  4.0),
        ("vid_3",                 3.5),   # salle couple
        ("vid_4",                 3.5),   # pouce levé
        ("card_04_cta.png",       5.5),
    ]

    # b2b_30s : titre → traiteur card → terrasse → CTA
    b2b_seq = [
        ("card_00_title.png",    4.0),
        ("card_02_traiteur.png", 4.0),
        ("vid_1",                5.0),   # terrasse
        ("vid_4",                4.0),   # pouce levé
        ("card_04_cta.png",      5.5),
    ]

    # whatsapp_15s : titre → façade → CTA
    wa_seq = [
        ("card_00_title.png",  4.0),
        ("vid_0",              4.5),   # façade
        ("vid_4",              3.0),   # pouce levé
        ("card_04_cta.png",    5.0),
    ]

    total_dur = 4.5 + 4.5 + 4.0 + 4.5 + 4.0 + 4.5 + 4.0 + 3.5 + 3.5 + 5.5  # raw main
    print(f"\n── Phase 2 / Génération audio ({total_dur:.0f}s brut) ────────────")
    audio = generate_audio(total_dur)

    compile_sequence(main_seq, card_paths, audio, "main_45s")
    compile_sequence(b2b_seq,  card_paths, audio, "b2b_30s")
    compile_sequence(wa_seq,   card_paths, audio, "whatsapp_15s")

    elapsed = time.time() - t0
    print(f"\n{'=' * 62}")
    print(f"  Terminé en {elapsed:.0f}s\n")
    for name in ("main_45s", "b2b_30s", "whatsapp_15s"):
        f = OUT_DIR / f"{name}.mp4"
        size_mb = f.stat().st_size / 1e6 if f.exists() else 0
        print(f"  📹  {f.name}  ({size_mb:.1f} MB)")
    print()


if __name__ == "__main__":
    main()
