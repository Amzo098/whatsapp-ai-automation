// ================================
// INTÉGRATION GOOGLE GEMINI AI
// ================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Prompt système par défaut (modifiable dans .env)
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT ||
  'Tu es un agent de support client professionnel et sympathique. Tu réponds en français, de manière claire et concise.';

// Anti-spam : stocker les timestamps des dernières requêtes
const lastRequestTime = {};
const COOLDOWN_MS = 2000; // 2 secondes entre chaque message

// Générer une réponse avec Gemini
async function generateResponse(phoneNumber, userMessage) {
  try {
    // Vérification anti-spam
    const now = Date.now();
    if (lastRequestTime[phoneNumber] && (now - lastRequestTime[phoneNumber]) < COOLDOWN_MS) {
      console.log(`⏳ Anti-spam : message ignoré pour ${phoneNumber}`);
      return null;
    }
    lastRequestTime[phoneNumber] = now;

    console.log(`🤖 Envoi à Gemini : "${userMessage.substring(0, 50)}..."`);

    // Initialiser le modèle
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construire le prompt avec contexte système
    const fullPrompt = `${SYSTEM_PROMPT}\n\nMessage du client : ${userMessage}\n\nRéponds de manière utile et professionnelle :`;

    // Générer la réponse
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    console.log(`✅ Réponse Gemini : "${response.substring(0, 50)}..."`);

    // Simuler un délai humain (1-3 secondes)
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    return response;

  } catch (err) {
    console.error('❌ Erreur Gemini:', err.message);
    return "Désolé, je rencontre une difficulté technique. Un agent humain va vous répondre bientôt.";
  }
}

module.exports = { generateResponse };
