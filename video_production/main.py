"""
Maoba Marketing Digital — Video Production Pipeline
====================================================

Orchestrates the full pipeline for one client:
  1. prepare_images  — resize/crop photos
  2. create_cards    — render text-card PNGs
  3. generate_audio  — synthesise background music
  4. assemble_video  — combine everything with FFmpeg

Produces multiple video formats from config.CARDS + config.PHOTO_SEQUENCE:
  • main_45s.mp4        — full presentation (~45 s)
  • b2b_30s.mp4         — B2B event cut (~30 s, services + CTA only)
  • whatsapp_status.mp4 — quick status cut (~15-20 s)

Usage:
    python main.py
    python main.py --client autre_client --formats all
    python main.py --formats b2b whatsapp
    python main.py --skip-prepare   (if photos already prepared)
"""

import argparse
import shutil
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import config as cfg
from prepare_images import prepare_images
from create_cards   import create_cards
from generate_audio import generate_audio
from assemble_video import assemble


# ─── Sequence builders ────────────────────────────────────────────────────────

def _photo_path(name: str, client_id: str) -> Path | None:
    p = Path(__file__).parent / "clients" / client_id / "prepared" / name
    stem = Path(name).stem
    for ext in (".jpg", ".jpeg", ".png"):
        candidate = p.parent / (stem + ext)
        if candidate.exists():
            return candidate
    return None


def _build_main_sequence(client_id: str) -> list[tuple[Path, float]]:
    """Full ~45 s sequence: interleave cards with photos."""
    cards_dir = Path(__file__).parent / "clients" / client_id / "cards"
    seq: list[tuple[Path, float]] = []

    photo_iter = iter(enumerate(cfg.PHOTO_SEQUENCE))

    for i, card in enumerate(cfg.CARDS):
        card_path = cards_dir / f"card_{i:02d}.png"
        dur       = cfg.CARD_DURATION.get(card["type"], 3.5)
        seq.append((card_path, dur))

        # Insert one photo after every service card (if available)
        if card["type"] == "service":
            try:
                _, photo_name = next(photo_iter)
                photo = _photo_path(photo_name, client_id)
                if photo:
                    seq.append((photo, cfg.PHOTO_DURATION))
                else:
                    print(f"  [warn] Photo not found: {photo_name} — skipped")
            except StopIteration:
                pass

    return seq


def _build_b2b_sequence(client_id: str) -> list[tuple[Path, float]]:
    """~30 s: title + traiteur card + 1 photo + CTA."""
    cards_dir = Path(__file__).parent / "clients" / client_id / "cards"
    seq: list[tuple[Path, float]] = []

    # Title card
    seq.append((cards_dir / "card_00.png", cfg.CARD_DURATION["title"]))

    # Find the traiteur card (index 1 in default CARDS)
    traiteur_idx = next(
        (i for i, c in enumerate(cfg.CARDS) if "TRAITEUR" in c.get("title", "").upper()),
        1,
    )
    seq.append((cards_dir / f"card_{traiteur_idx:02d}.png", 4.0))

    # One photo
    if cfg.PHOTO_SEQUENCE:
        photo = _photo_path(cfg.PHOTO_SEQUENCE[0], client_id)
        if photo:
            seq.append((photo, 4.0))

    # CTA card (last)
    cta_idx = next(
        (i for i, c in enumerate(cfg.CARDS) if c.get("type") == "cta"),
        len(cfg.CARDS) - 1,
    )
    seq.append((cards_dir / f"card_{cta_idx:02d}.png", cfg.CARD_DURATION["cta"]))
    return seq


def _build_whatsapp_sequence(client_id: str) -> list[tuple[Path, float]]:
    """~15 s: title + 1 photo + CTA."""
    cards_dir = Path(__file__).parent / "clients" / client_id / "cards"

    photo = None
    if cfg.PHOTO_SEQUENCE:
        photo = _photo_path(cfg.PHOTO_SEQUENCE[0], client_id)

    cta_idx = next(
        (i for i, c in enumerate(cfg.CARDS) if c.get("type") == "cta"),
        len(cfg.CARDS) - 1,
    )

    seq = [
        (cards_dir / "card_00.png", 4.0),
    ]
    if photo:
        seq.append((photo, 4.0))
    seq.append((cards_dir / f"card_{cta_idx:02d}.png", cfg.CARD_DURATION["cta"]))
    return seq


# ─── Runner ──────────────────────────────────────────────────────────────────

def _total_duration(seq: list[tuple[Path, float]]) -> float:
    td  = cfg.TRANSITION_DUR
    dur = sum(d for _, d in seq)
    dur -= td * (len(seq) - 1)
    return max(dur, 1.0)


def run(client_id: str, formats: list[str], skip_prepare: bool) -> None:
    t0       = time.time()
    base     = Path(__file__).parent / "clients" / client_id
    out_dir  = Path(__file__).parent / "output" / client_id
    tmp_dir  = base / "_tmp"
    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f" Maoba Marketing Digital — {client_id}")
    print(f"{'='*60}\n")

    # 1 — Prepare images
    if not skip_prepare:
        print("── Phase 1 / Prepare images ──────────────────────────────")
        prepare_images(client_id)
    else:
        print("── Phase 1 / Prepare images  [skipped] ───────────────────")

    # 2 — Create cards
    print("\n── Phase 2 / Create text cards ───────────────────────────")
    create_cards(client_id)

    # 3 — Build sequences
    sequences = {}
    if "main" in formats or "all" in formats:
        sequences["main_45s"] = _build_main_sequence(client_id)
    if "b2b" in formats or "all" in formats:
        sequences["b2b_30s"] = _build_b2b_sequence(client_id)
    if "whatsapp" in formats or "all" in formats:
        sequences["whatsapp_status"] = _build_whatsapp_sequence(client_id)

    if not sequences:
        print("[warn] No formats selected. Use --formats main b2b whatsapp  or  --formats all")
        return

    # 4 — Generate one audio track (longest sequence)
    longest = max(_total_duration(s) for s in sequences.values())
    print(f"\n── Phase 3 / Generate audio ({longest:.1f}s) ─────────────────")
    audio = generate_audio(longest, client_id)

    # 5 — Assemble each format
    print("\n── Phase 4 / Assemble videos ─────────────────────────────")
    for name, seq in sequences.items():
        dur    = _total_duration(seq)
        output = out_dir / f"{name}.mp4"
        print(f"\n  → {name}.mp4  ({dur:.1f}s, {len(seq)} clips)")
        assemble(seq, audio, output, tmp_dir=tmp_dir / name)

    # Cleanup temp
    shutil.rmtree(tmp_dir, ignore_errors=True)

    elapsed = time.time() - t0
    print(f"\n{'='*60}")
    print(f" Done in {elapsed:.0f}s — videos saved to {out_dir}")
    print(f"{'='*60}\n")
    for name in sequences:
        print(f"  📹  {out_dir / (name + '.mp4')}")
    print()


# ─── CLI ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Maoba Marketing Digital — Video Production Pipeline"
    )
    parser.add_argument(
        "--client", default=cfg.CLIENT_ID,
        help="Client ID (matches clients/<id>/ folder)"
    )
    parser.add_argument(
        "--formats", nargs="+",
        default=["all"],
        choices=["main", "b2b", "whatsapp", "all"],
        help="Video formats to produce"
    )
    parser.add_argument(
        "--skip-prepare", action="store_true",
        help="Skip image preparation (photos already in prepared/)"
    )
    args = parser.parse_args()
    run(args.client, args.formats, args.skip_prepare)
