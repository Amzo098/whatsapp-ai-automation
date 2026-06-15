# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-component AI automation platform with two independent subsystems:

1. **WhatsApp AI Chatbot** — Node.js/Express server that receives WhatsApp messages via Meta's Cloud API webhook, generates AI replies using Google Gemini, and serves a real-time conversation dashboard.
2. **Video Production Pipeline** — Python automation system for generating branded marketing videos (MP4) for individual clients using Pillow and FFmpeg.

These two subsystems share only the repository; they have no runtime dependency on each other.

## Commands

### WhatsApp Backend (Node.js)

```bash
npm install          # Install dependencies
npm run dev          # Development mode with nodemon (hot reload)
npm start            # Production mode (node backend/server.js)
```

No lint or test scripts are configured.

### Video Production Pipeline (Python)

```bash
cd video_production

# Run full pipeline for a client
python main.py --client restaurant_occidental --formats all

# Run specific format(s): main, b2b, whatsapp, or all
python main.py --client restaurant_occidental --formats whatsapp

# Skip re-preparing photos (reuse existing prepared/ folder)
python main.py --client restaurant_occidental --formats all --skip-prepare

# Scaffold a new client
python new_client.py --id my_client --name "Client Name" --location "City" \
  --phone "+224..." --primary "7,94,84" --accent "37,211,102" --slogan "Tagline"
```

Python dependencies: `Pillow>=10.0.0`, `numpy>=1.24.0`. FFmpeg must be installed separately on the system.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `WHATSAPP_TOKEN` | Meta Cloud API bearer token |
| `WHATSAPP_PHONE_ID` | WhatsApp Business phone number ID |
| `VERIFY_TOKEN` | Custom string for Meta webhook verification handshake |
| `PORT` | HTTP server port (default: 3000) |
| `SYSTEM_PROMPT` | Optional system prompt to customize AI personality/behavior |

## Architecture

### WhatsApp Bot — Request Flow

```
WhatsApp User → Meta Cloud API → POST /webhook → webhook.js
                                                    │
                                         ┌──────────┴───────────┐
                                         ↓                       ↓
                                  storage.js              200 OK (immediate)
                                  (save user msg)               │
                                         │               gemini.js (async)
                                         │               generateResponse()
                                         └────────────── sendWhatsAppMessage()
                                                                 ↓
                                                       Meta Cloud API v18.0
```

**Critical constraint**: Meta requires a `200 OK` within 20 seconds. `webhook.js:receiveMessage()` responds immediately and processes AI generation asynchronously via a fire-and-forget pattern.

**Anti-spam**: `gemini.js` maintains a `lastRequestTime` map per phone number with a 2-second cooldown, plus a 1–3 second simulated human delay before sending.

**Persistence**: All conversations are stored as flat JSON at `data/conversations.json` (gitignored). `storage.js` initializes the file on module load if absent.

### Backend Modules

- `backend/server.js` — Express app; mounts routes, serves static frontend
- `backend/webhook.js` — Webhook verification + message receipt; calls gemini and storage
- `backend/gemini.js` — Gemini 1.5 Flash wrapper with rate limiting and delay simulation
- `backend/storage.js` — File-based JSON persistence for conversation history

### Frontend Dashboard

Single-page app at `http://localhost:3000` served as static files from `frontend/`. Fetches `/api/conversations` and `/api/stats` and auto-refreshes every 30 seconds. No build step — vanilla JS and CSS only.

### Video Production Pipeline — Module Roles

Located in `video_production/`. Each module is a standalone script orchestrated by `main.py`:

| File | Role |
|---|---|
| `config.py` | All client-specific config: identity, brand colors (RGB tuples), font paths, card content, photo sequence, timing, audio BPM |
| `prepare_images.py` | Crops raw photos to 1620×2880 (1.5× output res for zoom headroom) using Pillow |
| `create_cards.py` | Renders text overlay cards (gradient bg + title/subtitle/body/CTA) as PNG |
| `generate_audio.py` | Synthesizes background music WAV→MP3 using BPM from config |
| `assemble_video.py` | Combines cards + photos with xfade transitions via FFmpeg into MP4 |
| `new_client.py` | Scaffolds a new client directory and `config.py` from template |

**Client structure**: Each client lives under `video_production/clients/<client_id>/` with subdirectories `photos/`, `prepared/`, `cards/`, `audio/`. Output goes to `video_production/output/<client_id>/`.

**Three output formats**:
- `main_45s` — Full presentation interleaving cards and photos (~45s)
- `b2b_30s` — Business-focused short cut (~30s)
- `whatsapp_status` — Social/WhatsApp status quick cut (~15–20s, 9:16 portrait 1080×1920)

## Adding a New Client (Video Pipeline)

1. Run `new_client.py` to scaffold the directory and generate a template `config.py`
2. Drop client photos into `clients/<id>/photos/`
3. Edit the generated `config.py`: update `CARDS`, `PHOTO_SEQUENCE`, `PHOTO_CAPTIONS`, brand colors, fonts, and timing
4. Run `main.py --client <id> --formats all`

## Deployment Notes

The WhatsApp webhook (`POST /webhook`) must be publicly reachable for Meta to deliver messages. Common approaches: deploy to Render, or tunnel locally with ngrok. The public URL must be registered in the Meta developer console along with `VERIFY_TOKEN`.
