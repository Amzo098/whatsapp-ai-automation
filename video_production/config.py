"""
Client configuration — duplicate this block for each new client.
Change the variables below; the pipeline adapts automatically.
"""

# ─── IDENTITY ────────────────────────────────────────────────────────────────
CLIENT_ID   = "restaurant_occidental"      # used as folder name
CLIENT_NAME = "Restaurant Occidental"
LOCATION    = "Boké, Guinée"
SLOGAN      = "La bonne cuisine tout près de chez vous"

# ─── CONTACT ─────────────────────────────────────────────────────────────────
WHATSAPP_NUMBER = "610 32 11 72"
WEBSITE         = ""                       # leave empty to hide

# ─── BRAND COLOURS  (R, G, B) ────────────────────────────────────────────────
COLOR_PRIMARY   = (15,  76, 140)           # deep blue
COLOR_ACCENT    = (244, 180,  54)          # gold
COLOR_DARK      = (8,   40,  80)           # darker blue for gradients
COLOR_LIGHT_TXT = (235, 235, 235)          # near-white body text
COLOR_DARK_TXT  = (20,  20,  20)

# ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────
# Path to a TTF file, or None to fall back to default PIL font.
# Download Poppins from Google Fonts and place next to config.py:
#   wget https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf
FONT_BOLD     = "Poppins-Bold.ttf"
FONT_SEMIBOLD = "Poppins-SemiBold.ttf"
FONT_REGULAR  = "Poppins-Regular.ttf"

# ─── OUTPUT FORMAT ───────────────────────────────────────────────────────────
VIDEO_W, VIDEO_H = 1080, 1920             # vertical 9:16
PREP_W,  PREP_H  = 1620, 2880            # 1.5× for Ken-Burns headroom
FPS              = 30

# ─── TEXT CARDS ──────────────────────────────────────────────────────────────
# Each card: (title, subtitle, body_lines, cta_text|None)
CARDS = [
    {
        "type":     "title",
        "title":    CLIENT_NAME.upper(),
        "subtitle": LOCATION,
        "body":     [SLOGAN],
        "cta":      None,
    },
    {
        "type":     "service",
        "title":    "NOS SPÉCIALITÉS",
        "subtitle": "Cuisine africaine & internationale",
        "body":     ["Brochettes · Poulet braisé · Riz sauce", "Poissons grillés · Plats du jour"],
        "cta":      None,
    },
    {
        "type":     "service",
        "title":    "AUSSI TRAITEUR",
        "subtitle": "Événements sur mesure",
        "body":     ["Mariages · Cérémonies", "Anniversaires · Réceptions d'entreprises"],
        "cta":      None,
    },
    {
        "type":     "service",
        "title":    "POURQUOI NOUS ?",
        "subtitle": "",
        "body":     ["✔ Ingrédients frais chaque jour",
                     "✔ Équipe professionnelle",
                     "✔ Cadre chaleureux & propre",
                     "✔ Prix accessibles"],
        "cta":      None,
    },
    {
        "type":     "cta",
        "title":    "RÉSERVEZ MAINTENANT",
        "subtitle": "Une minute suffit",
        "body":     [f"WhatsApp : {WHATSAPP_NUMBER}"],
        "cta":      f"Appeler / WhatsApp · {WHATSAPP_NUMBER}",
    },
]

# ─── PHOTO SLOTS ─────────────────────────────────────────────────────────────
# After each card index insert a photo from this list (None = no photo between)
# e.g. PHOTO_AFTER_CARD[0] = "plat1.jpg" inserts a photo after card 0
PHOTO_SEQUENCE = [
    "plat1.jpg",
    "plat2.jpg",
    "plat3.jpg",
    "facade.jpg",
    "salle.jpg",
]

# Captions displayed over photos (same order as PHOTO_SEQUENCE, can be "")
PHOTO_CAPTIONS = [
    "Brochettes grillées",
    "Riz sauce arachide",
    "Poulet braisé",
    "Bienvenue chez nous",
    "Salle climatisée",
]

# ─── TIMING (seconds) ────────────────────────────────────────────────────────
CARD_DURATION  = {
    "title":   4.0,
    "service": 3.5,
    "cta":     5.0,
}
PHOTO_DURATION  = 4.0
TRANSITION_DUR  = 0.40          # xfade duration

# ─── AUDIO ───────────────────────────────────────────────────────────────────
AUDIO_BPM       = 104
AUDIO_EXTRA_SEC = 2.0           # tail added beyond video length for fade-out
