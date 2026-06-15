"""
Step 2 – Generate text-card PNG images.

Produces one PNG per card defined in config.CARDS.
Output → clients/<CLIENT_ID>/cards/card_00.png …

Usage:
    python create_cards.py
    python create_cards.py --client autre_client
"""

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, str(Path(__file__).parent))
import config as cfg


# ─── Font helpers ─────────────────────────────────────────────────────────────

def _load_font(path: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    font_file = Path(__file__).parent / path
    try:
        return ImageFont.truetype(str(font_file), size)
    except (IOError, OSError):
        # Fallback: PIL built-in bitmap font (no bold/italic)
        return ImageFont.load_default()


# ─── Drawing primitives ───────────────────────────────────────────────────────

def _gradient_bg(w: int, h: int) -> Image.Image:
    """Vertical gradient from COLOR_PRIMARY to COLOR_DARK."""
    img = Image.new("RGB", (w, h))
    r1, g1, b1 = cfg.COLOR_PRIMARY
    r2, g2, b2 = cfg.COLOR_DARK
    for y in range(h):
        t  = y / h
        px = int(r1 + (r2 - r1) * t)
        gx = int(g1 + (g2 - g1) * t)
        bx = int(b1 + (b2 - b1) * t)
        draw = ImageDraw.Draw(img)
        draw.line([(0, y), (w, y)], fill=(px, gx, bx))
    return img


def _draw_glow(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int) -> None:
    """Soft golden radial halo."""
    r, g, b = cfg.COLOR_ACCENT
    steps   = 6
    for i in range(steps, 0, -1):
        alpha = int(18 * (i / steps))
        rad   = radius * i // steps
        x0, y0 = cx - rad, cy - rad
        x1, y1 = cx + rad, cy + rad
        draw.ellipse([x0, y0, x1, y1], fill=(r, g, b, alpha))


def _gold_line(draw: ImageDraw.ImageDraw, x: int, y: int, width: int) -> None:
    draw.rectangle([x, y, x + width, y + 4], fill=cfg.COLOR_ACCENT)


def _centered_text(
    draw:  ImageDraw.ImageDraw,
    text:  str,
    font:  ImageFont.FreeTypeFont,
    y:     int,
    w:     int,
    color: tuple,
) -> int:
    """Draw text centered horizontally; return new y after the text block."""
    bbox = draw.textbbox((0, 0), text, font=font)
    tw   = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, y), text, font=font, fill=color)
    return y + (bbox[3] - bbox[1])


def _wrapped_text(
    draw:    ImageDraw.ImageDraw,
    lines:   list[str],
    font:    ImageFont.FreeTypeFont,
    y:       int,
    w:       int,
    color:   tuple,
    spacing: int = 18,
) -> int:
    for line in lines:
        y = _centered_text(draw, line, font, y, w, color) + spacing
    return y


# ─── Card renderer ────────────────────────────────────────────────────────────

def render_card(card: dict, idx: int, w: int = cfg.VIDEO_W, h: int = cfg.VIDEO_H) -> Image.Image:
    img  = _gradient_bg(w, h)
    rgba = img.convert("RGBA")
    draw = ImageDraw.Draw(rgba, "RGBA")

    # Subtle radial glow at top-center
    _draw_glow(draw, w // 2, h // 4, 600)

    img  = rgba.convert("RGB")
    draw = ImageDraw.Draw(img)

    font_title    = _load_font(cfg.FONT_BOLD,     90)
    font_subtitle = _load_font(cfg.FONT_SEMIBOLD, 52)
    font_body     = _load_font(cfg.FONT_REGULAR,  46)
    font_cta      = _load_font(cfg.FONT_SEMIBOLD, 50)

    cy = h // 5                             # start ~20 % from top

    # Title
    if card.get("title"):
        # Wrap long titles manually at 16 chars per line
        title = card["title"]
        words = title.split()
        lines, cur = [], ""
        for word in words:
            if len(cur) + len(word) + 1 > 16 and cur:
                lines.append(cur.strip())
                cur = word + " "
            else:
                cur += word + " "
        if cur:
            lines.append(cur.strip())

        for line in lines:
            cy = _centered_text(draw, line, font_title, cy, w, cfg.COLOR_ACCENT) + 8
        cy += 8
        # Gold accent line
        line_w = min(400, w // 2)
        _gold_line(draw, (w - line_w) // 2, cy, line_w)
        cy += 22

    # Subtitle
    if card.get("subtitle"):
        cy = _centered_text(draw, card["subtitle"], font_subtitle, cy, w, cfg.COLOR_LIGHT_TXT) + 28

    # Divider
    draw.line([(w // 4, cy), (3 * w // 4, cy)], fill=(*cfg.COLOR_ACCENT, 80), width=2)
    cy += 32

    # Body lines
    if card.get("body"):
        cy = _wrapped_text(draw, card["body"], font_body, cy, w, cfg.COLOR_LIGHT_TXT, spacing=22)
        cy += 16

    # CTA button
    if card.get("cta"):
        btn_text = card["cta"]
        btn_w    = w - 160
        btn_h    = 110
        btn_x    = 80
        btn_y    = h - 260

        # Button shadow
        draw.rounded_rectangle(
            [btn_x + 6, btn_y + 6, btn_x + btn_w + 6, btn_y + btn_h + 6],
            radius=55, fill=(0, 0, 0, 80),
        )
        # Button fill
        draw.rounded_rectangle(
            [btn_x, btn_y, btn_x + btn_w, btn_y + btn_h],
            radius=55, fill=cfg.COLOR_ACCENT,
        )
        # Button text
        _centered_text(draw, btn_text, font_cta, btn_y + 28, w, cfg.COLOR_DARK_TXT)

    return img


# ─── Entry point ──────────────────────────────────────────────────────────────

def create_cards(client_id: str = cfg.CLIENT_ID) -> list[Path]:
    out_dir = Path(__file__).parent / "clients" / client_id / "cards"
    out_dir.mkdir(parents=True, exist_ok=True)

    paths = []
    for i, card in enumerate(cfg.CARDS):
        img  = render_card(card, i)
        dest = out_dir / f"card_{i:02d}.png"
        img.save(dest, "PNG")
        paths.append(dest)
        print(f"  ✔ card_{i:02d}.png  [{card['type']}] → {dest}")

    print(f"\n[create_cards] {len(paths)} cards generated → {out_dir}")
    return paths


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate text cards")
    parser.add_argument("--client", default=cfg.CLIENT_ID)
    args = parser.parse_args()
    create_cards(args.client)
