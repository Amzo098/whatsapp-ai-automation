// ================================
// WEBHOOK WHATSAPP
// ================================

const axios = require('axios');
const { generateResponse } = require('./gemini');
const { saveMessage } = require('./storage');
require('dotenv').config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ── Vérification du webhook Meta ──────────────────────────
function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔗 Vérification webhook Meta...');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook vérifié avec succès !');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Échec vérification webhook');
    res.status(403).send('Forbidden');
  }
}

// ── Réception des messages entrants ──────────────────────
async function receiveMessage(req, res) {
  try {
    const body = req.body;

    // Vérifier que c'est bien un message WhatsApp
    if (body.object !== 'whatsapp_business_account') {
      return res.status(400).send('Not WhatsApp');
    }

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;

    // Si pas de message, ignorer
    if (!messages || messages.length === 0) {
      return res.status(200).send('OK');
    }

    const msg = messages[0];
    const phoneNumber = msg.from;
    const messageType = msg.type;

    // Traiter uniquement les messages texte
    if (messageType !== 'text') {
      console.log(`⚠️ Type de message non supporté : ${messageType}`);
      return res.status(200).send('OK');
    }

    const userMessage = msg.text.body;
    console.log(`📩 Message reçu de ${phoneNumber} : "${userMessage}"`);

    // Sauvegarder le message utilisateur
    saveMessage(phoneNumber, 'user', userMessage);

    // Répondre immédiatement à Meta (obligatoire sous 20 secondes)
    res.status(200).send('OK');

    // Générer et envoyer la réponse IA (en arrière-plan)
    const aiResponse = await generateResponse(phoneNumber, userMessage);

    if (aiResponse) {
      await sendWhatsAppMessage(phoneNumber, aiResponse);
      saveMessage(phoneNumber, 'bot', aiResponse);
    }

  } catch (err) {
    console.error('❌ Erreur webhook:', err.message);
    res.status(200).send('OK'); // Toujours répondre 200 à Meta
  }
}

// ── Envoi d'un message WhatsApp ───────────────────────────
async function sendWhatsAppMessage(to, message) {
  try {
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;

    await axios.post(url, {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message }
    }, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📤 Message envoyé à ${to}`);

  } catch (err) {
    console.error('❌ Erreur envoi WhatsApp:', err.response?.data || err.message);
  }
}

module.exports = { verifyWebhook, receiveMessage };
