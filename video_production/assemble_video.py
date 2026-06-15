"""
Step 4 – Assemble clips into the final video with FFmpeg.

Strategy (avoids timeout on long pipelines):
  1. Convert each image/card to a short Ken-Burns clip  → temp clips
  2. Group clips into blocks of BLOCK_SIZE and xfade-merge each block → parts
  3. Concat all parts + mix audio → final video

Usage:
    python assemble_video.py --clips path1.png dur1 path2.jpg dur2 ...
    (normally called by main.py, not directly)
"""

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Sequence

sys.path.insert(0, str(Path(__file__).parent))
import config as cfg

BLOCK_SIZE = 4          # clips per intermediate part
CRF        = 19
PRESET     = "veryfast"


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _run(cmd: list[str], label: str) -> None:
    """Run an FFmpeg command, raise on failure."""
    print(f"  [ffmpeg] {label}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stderr[-2000:])        # last 2 kB of stderr
        raise RuntimeError(f"FFmpeg failed: {label}")


def _ken_burns_clip(src: Path, duration: float, out: Path) -> None:
    """Convert a static image to a short video with zoom-pan (Ken Burns)."""
    frames  = int(duration * cfg.FPS)
    w, h    = cfg.VIDEO_W, cfg.VIDEO_H
    # Zoom from 1.00 → ~1.09 over the clip
    vf = (
        f"zoompan=z='1+0.0006*on':d={frames}:s={w}x{h}:fps={cfg.FPS}"
        f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',"
        "format=yuv420p"
    )
    _run(
        [
            "ffmpeg", "-y",
            "-loop", "1", "-i", str(src),
            "-t", str(duration),
            "-vf", vf,
            "-c:v", "libx264", "-preset", PRESET, "-crf", str(CRF),
            str(out),
        ],
        f"ken-burns  {src.name} ({duration}s)",
    )


def _xfade_merge(clips: list[Path], durations: list[float], out: Path) -> None:
    """Chain N clips with xfade transitions into a single video part."""
    td   = cfg.TRANSITION_DUR
    if len(clips) == 1:
        # Single clip: just copy
        _run(
            ["ffmpeg", "-y", "-i", str(clips[0]),
             "-c:v", "libx264", "-preset", PRESET, "-crf", str(CRF), str(out)],
            f"copy single clip → {out.name}",
        )
        return

    inputs  = []
    for c in clips:
        inputs += ["-i", str(c)]

    # Build complex xfade filter
    # cumulative offset = sum of (duration_i - transition_dur) for i < current
    filt_parts = []
    offset     = 0.0
    prev_label = "[0:v]"

    for i in range(1, len(clips)):
        offset += durations[i - 1] - td
        cur_label = f"[v{i}]" if i < len(clips) - 1 else "[vout]"
        filt_parts.append(
            f"{prev_label}[{i}:v]xfade=transition=fade"
            f":duration={td}:offset={offset:.4f}{cur_label}"
        )
        prev_label = cur_label

    filter_complex = ";".join(filt_parts)
    _run(
        [
            "ffmpeg", "-y",
            *inputs,
            "-filter_complex", filter_complex,
            "-map", "[vout]",
            "-c:v", "libx264", "-preset", PRESET, "-crf", str(CRF),
            "-pix_fmt", "yuv420p",
            str(out),
        ],
        f"xfade {len(clips)} clips → {out.name}",
    )


def _concat_parts(parts: list[Path], out: Path) -> None:
    """Concatenate intermediate part files (no re-encode)."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as fh:
        for p in parts:
            fh.write(f"file '{p.resolve()}'\n")
        list_path = Path(fh.name)

    _run(
        [
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0", "-i", str(list_path),
            "-c", "copy",
            str(out),
        ],
        f"concat {len(parts)} parts → {out.name}",
    )
    list_path.unlink(missing_ok=True)


def _mix_audio(video: Path, audio: Path, out: Path) -> None:
    """Attach audio to a muted video, trim to video length, fade out 2 s."""
    _run(
        [
            "ffmpeg", "-y",
            "-i", str(video),
            "-i", str(audio),
            "-c:v", "copy",
            "-c:a", "aac", "-b:a", "160k",
            "-filter:a", "afade=t=out:st=-2:d=2",
            "-shortest",
            str(out),
        ],
        f"mix audio → {out.name}",
    )


# ─── Main assembly ────────────────────────────────────────────────────────────

def assemble(
    items:     list[tuple[Path, float]],       # (image_path, duration_sec)
    audio:     Path,
    out_path:  Path,
    tmp_dir:   Path | None = None,
) -> Path:
    """
    Full pipeline:
      items    — ordered list of (image, duration)
      audio    — WAV background track
      out_path — final MP4 destination
    """
    use_tmp = tmp_dir or out_path.parent / "_tmp"
    use_tmp.mkdir(parents=True, exist_ok=True)

    # 1. Ken-Burns clips
    print("\n[assemble] Step 1/4 — Generating Ken-Burns clips …")
    kb_clips: list[tuple[Path, float]] = []
    for i, (src, dur) in enumerate(items):
        clip_path = use_tmp / f"clip_{i:03d}.mp4"
        _ken_burns_clip(src, dur, clip_path)
        kb_clips.append((clip_path, dur))

    # 2. Split into blocks → intermediate parts
    print("\n[assemble] Step 2/4 — Merging blocks with xfade …")
    parts: list[Path] = []
    block_idx = 0
    for start in range(0, len(kb_clips), BLOCK_SIZE):
        block = kb_clips[start:start + BLOCK_SIZE]
        part  = use_tmp / f"part_{block_idx:02d}.mp4"
        _xfade_merge([c for c, _ in block], [d for _, d in block], part)
        parts.append(part)
        block_idx += 1

    # 3. Concatenate all parts into one muted video
    print("\n[assemble] Step 3/4 — Concatenating parts …")
    muted = use_tmp / "video_muted.mp4"
    if len(parts) == 1:
        parts[0].rename(muted) if not muted.exists() else None
        muted = parts[0]
    else:
        _concat_parts(parts, muted)

    # 4. Mix audio
    print("\n[assemble] Step 4/4 — Mixing audio …")
    _mix_audio(muted, audio, out_path)

    print(f"\n[assemble] ✅  Final video → {out_path}")
    return out_path


# ─── CLI ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Assemble images into a video with Ken-Burns + xfade + audio"
    )
    parser.add_argument(
        "clips", nargs="+",
        help="Alternating: path duration  (e.g. card.png 4 photo.jpg 3.5)"
    )
    parser.add_argument("--audio",  required=True, help="WAV audio path")
    parser.add_argument("--output", required=True, help="Output MP4 path")
    args = parser.parse_args()

    raw = args.clips
    if len(raw) % 2 != 0:
        sys.exit("Error: clips must be pairs of  path  duration")

    items = [(Path(raw[i]), float(raw[i + 1])) for i in range(0, len(raw), 2)]
    assemble(items, Path(args.audio), Path(args.output))
