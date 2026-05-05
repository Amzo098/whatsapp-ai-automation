// ================================
// SERVEUR PRINCIPAL
// ================================

require('dotenv').config();
const express = require('express');
const path = require('path');
const { verifyWebhook, receiveMessage } = require('./webhook');
const { getAllConversations, getStats } = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Routes Webhook WhatsApp ───────────────────────────────

// Vérification du webhook (GET - demandé par Meta)
app.get('/webhook', verifyWebhook);

// Réception des messages (POST - envoyé par Meta)
app.post('/webhook', receiveMessage);

// ── Routes API Dashboard ──────────────────────────────────

// Toutes les conversations
app.get('/api/conversations', (req, res) => {
  try {
    const conversations = getAllConversations();
    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Statistiques globales
app.get('/api/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Page dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Démarrage du serveur ──────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log('   WhatsApp AI Bot - DÉMARRÉ');
  console.log('================================');
  console.log(`📡 Serveur : http://localhost:${PORT}`);
  console.log(`🔗 Webhook : http://localhost:${PORT}/webhook`);
  console.log(`📊 Dashboard : http://localhost:${PORT}`);
  console.log('================================');
  console.log('');
});
