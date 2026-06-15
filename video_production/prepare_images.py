"""
Step 1 – Prepare client photos for video production.

Reads raw photos from  clients/<CLIENT_ID>/photos/
Writes cropped images to clients/<CLIENT_ID>/prepared/

Usage:
    python prepare_images.py
    python prepare_images.py --client autre_client
"""

import argparse
import sys
from pathlib import Path
from PIL import Image, ImageOps

# Allow running from any directory
sys.path.insert(0, str(Path(__file__).parent))
import config as cfg


SUPPORTED = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}


def prepare_images(client_id: str = cfg.CLIENT_ID) -> list[Path]:
    base    = Path(__file__).parent / "clients" / client_id
    src_dir = base / "photos"
    out_dir = base / "prepared"
    out_dir.mkdir(parents=True, exist_ok=True)

    sources = sorted(p for p in src_dir.iterdir() if p.suffix.lower() in SUPPORTED)
    if not sources:
        print(f"[prepare_images] No images found in {src_dir}")
        return []

    prepared = []
    for src in sources:
        dst = out_dir / (src.stem + ".jpg")
        try:
            with Image.open(src) as im:
                im = ImageOps.exif_transpose(im).convert("RGB")
                # Fill target canvas, slightly top-biased (centering=(0.5, 0.45))
                im = ImageOps.fit(
                    im,
                    (cfg.PREP_W, cfg.PREP_H),
                    Image.LANCZOS,
                    centering=(0.5, 0.45),
                )
                im.save(dst, "JPEG", quality=92, optimize=True)
            prepared.append(dst)
            print(f"  ✔ {src.name} → {dst.name}  ({cfg.PREP_W}×{cfg.PREP_H})")
        except Exception as exc:
            print(f"  ✗ {src.name} — skipped ({exc})")

    print(f"\n[prepare_images] {len(prepared)}/{len(sources)} images prepared → {out_dir}")
    return prepared


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepare client photos")
    parser.add_argument("--client", default=cfg.CLIENT_ID)
    args = parser.parse_args()
    prepare_images(args.client)
