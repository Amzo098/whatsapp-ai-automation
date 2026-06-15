"""
Utility: scaffold a new client project from a template config.

Usage:
    python new_client.py --id boulangerie_moderne --name "Boulangerie Moderne" \
        --location "Conakry, Guinée" --phone "620 00 00 00" \
        --primary 180,50,20 --accent 255,200,0
"""

import argparse
import shutil
import sys
from pathlib import Path

TEMPLATE = Path(__file__).parent / "config.py"
CLIENTS  = Path(__file__).parent / "clients"


def scaffold(
    client_id: str,
    name: str,
    location: str,
    phone: str,
    primary: tuple[int, int, int],
    accent: tuple[int, int, int],
    slogan: str,
) -> None:
    dest_dir = CLIENTS / client_id
    if dest_dir.exists():
        sys.exit(f"Client '{client_id}' already exists at {dest_dir}")

    # Create directory structure
    for sub in ("photos", "prepared", "cards", "audio"):
        (dest_dir / sub).mkdir(parents=True)

    # Copy and patch config
    src_text = TEMPLATE.read_text(encoding="utf-8")
    patches  = {
        '"restaurant_occidental"': f'"{client_id}"',
        '"Restaurant Occidental"': f'"{name}"',
        '"Boké, Guinée"':          f'"{location}"',
        '"La bonne cuisine tout près de chez vous"': f'"{slogan}"',
        '"610 32 11 72"':          f'"{phone}"',
        "(15,  76, 140)":          f"({primary[0]}, {primary[1]}, {primary[2]})",
        "(244, 180,  54)":         f"({accent[0]}, {accent[1]}, {accent[2]})",
    }
    for old, new in patches.items():
        src_text = src_text.replace(old, new)

    config_path = dest_dir / "config.py"
    config_path.write_text(src_text, encoding="utf-8")

    print(f"\n✅  Client '{client_id}' created at {dest_dir}")
    print(f"   1. Drop photos into:  {dest_dir / 'photos'}")
    print(f"   2. Edit cards/texts:  {config_path}")
    print(f"   3. Run:  python main.py --client {client_id}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scaffold a new client project")
    parser.add_argument("--id",       required=True, help="Client identifier (snake_case)")
    parser.add_argument("--name",     required=True, help="Business name")
    parser.add_argument("--location", required=True, help="City, Country")
    parser.add_argument("--phone",    required=True, help="WhatsApp number")
    parser.add_argument("--slogan",   default="",    help="Tagline")
    parser.add_argument("--primary",  default="15,76,140",  help="Primary RGB e.g. 15,76,140")
    parser.add_argument("--accent",   default="244,180,54", help="Accent RGB e.g. 244,180,54")

    args = parser.parse_args()

    def _rgb(s: str) -> tuple[int, int, int]:
        parts = [int(x.strip()) for x in s.split(",")]
        if len(parts) != 3:
            sys.exit(f"Invalid RGB: {s}")
        return tuple(parts)  # type: ignore

    scaffold(
        args.id, args.name, args.location, args.phone,
        _rgb(args.primary), _rgb(args.accent), args.slogan,
    )
