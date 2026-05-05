# 🤖 WhatsApp AI Bot - Support Client Automatique

Bot WhatsApp avec intelligence artificielle (Gemini) pour automatiser le support client.

---

## ✨ Fonctionnalités

- ✅ Réponse automatique aux messages WhatsApp via IA
- ✅ Dashboard web pour voir toutes les conversations
- ✅ Historique complet des messages sauvegardé en JSON
- ✅ Anti-spam intégré
- ✅ Délai de réponse humain simulé
- ✅ Configuration du comportement de l'IA via prompt système

---

## 📁 Structure du projet

```
whatsapp-ai-automation/
├── backend/
│   ├── server.js       → Serveur Express principal
│   ├── webhook.js      → Gestion des messages WhatsApp
│   ├── gemini.js       → Intégration Google Gemini AI
│   └── storage.js      → Stockage JSON des conversations
├── frontend/
│   ├── index.html      → Dashboard web
│   ├── dashboard.js    → Logique du dashboard
│   └── style.css       → Design
├── data/
│   └── conversations.json  → Historique des conversations
├── .env.example        → Modèle de configuration
├── package.json
└── README.md
```

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/TON_USERNAME/whatsapp-ai-automation.git
cd whatsapp-ai-automation
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Ouvre `.env` et remplis les valeurs :

```env
GEMINI_API_KEY=ta_cle_gemini
WHATSAPP_TOKEN=ton_token_meta
WHATSAPP_PHONE_ID=ton_phone_id
VERIFY_TOKEN=un_mot_secret_que_tu_inventes
PORT=3000
```

### 4. Lancer le serveur

```bash
npm start
```

Le bot tourne sur **http://localhost:3000**

---

## 🔑 Obtenir les clés API

### Clé Gemini (Google)

1. Va sur https://aistudio.google.com
2. Connecte-toi avec ton compte Google
3. Clique **"Get API Key"** → **"Create API key"**
4. Copie la clé dans ton `.env`

### Token WhatsApp (Meta)

1. Va sur https://developers.facebook.com
2. Connecte-toi avec Facebook
3. Clique **"My Apps"** → **"Create App"**
4. Choisis **"Business"** → donne un nom
5. Dans l'app, cherche **"WhatsApp"** → clique **"Set up"**
6. Va dans **"API Setup"**
7. Copie le **"Temporary access token"** → c'est ton `WHATSAPP_TOKEN`
8. Copie le **"Phone number ID"** → c'est ton `WHATSAPP_PHONE_ID`

---

## 🔗 Configurer le Webhook Meta

Pour que Meta envoie les messages à ton serveur, il faut une URL publique.

### Option 1 : Ngrok (pour tester en local)

```bash
# Installer ngrok
npm install -g ngrok

# Dans un autre terminal
ngrok http 3000
```

Ngrok te donne une URL comme : `https://abc123.ngrok.io`

### Option 2 : Render.com (pour production - gratuit)

1. Va sur https://render.com
2. Crée un compte gratuit
3. **New** → **Web Service** → connecte ton GitHub
4. Sélectionne ce repo
5. Start command : `npm start`
6. Render te donne une URL comme : `https://ton-bot.onrender.com`

### Configurer le webhook dans Meta

1. Dans ton app Meta, va dans **WhatsApp** → **Configuration**
2. Dans **Webhook**, clique **"Edit"**
3. **Callback URL** : `https://TON_URL/webhook`
4. **Verify Token** : le même que dans ton `.env` (VERIFY_TOKEN)
5. Clique **"Verify and save"**
6. Active le champ **"messages"** dans les webhooks

---

## 📊 Dashboard

Ouvre ton navigateur sur **http://localhost:3000** pour voir :
- Nombre de conversations
- Nombre de messages traités
- Liste des conversations
- Détail de chaque conversation

---

## ⚙️ Personnaliser le comportement de l'IA

Dans ton `.env`, modifie `SYSTEM_PROMPT` :

```env
# Exemple pour une boutique de mode
SYSTEM_PROMPT=Tu es l'assistante virtuelle de "Luxury by Ange", une boutique de mode en ligne. Tu aides les clients avec leurs commandes, les tailles disponibles et les prix. Tu es sympathique et professionnelle. Tu réponds en français.

# Exemple pour un restaurant
SYSTEM_PROMPT=Tu es l'assistant du restaurant OKLM Grill à Conakry. Tu renseignes les clients sur le menu, les horaires (12h-22h), et tu prends les réservations. Tu réponds en français de manière chaleureuse.
```

---

## 🧪 Tester le bot

1. Dans Meta Developer → **WhatsApp** → **API Setup**
2. Dans **"Send and receive messages"**
3. Envoie un message test au numéro WhatsApp fourni par Meta
4. Le bot doit répondre automatiquement !

---

## 📝 Logs console

Quand le bot tourne, tu verras dans le terminal :

```
🚀 ================================
   WhatsApp AI Bot - DÉMARRÉ
================================
📡 Serveur : http://localhost:3000
🔗 Webhook : http://localhost:3000/webhook
📊 Dashboard : http://localhost:3000
================================

📩 Message reçu de 224XXXXXXXX : "Bonjour, j'ai une question..."
🤖 Envoi à Gemini : "Bonjour, j'ai une question..."
✅ Réponse Gemini : "Bonjour ! Je suis ravi de vous aider..."
📤 Message envoyé à 224XXXXXXXX
```

---

## 🛠️ Dépendances

| Package | Usage |
|---|---|
| express | Serveur web |
| @google/generative-ai | API Gemini |
| axios | Appels API WhatsApp |
| dotenv | Variables d'environnement |

---

## 👤 Auteur

Développé par **Amzo** — Guinée 🇬🇳
