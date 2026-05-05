// ================================
// GESTION DU STOCKAGE JSON
// ================================

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/conversations.json');

// Initialiser le fichier JSON s'il n'existe pas
function init() {
  if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ conversations: {} }, null, 2));
    console.log('📁 Fichier conversations.json créé');
  }
}

// Lire toutes les conversations
function readAll() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { conversations: {} };
  }
}

// Sauvegarder un message
function saveMessage(phoneNumber, role, message) {
  const data = readAll();

  // Créer la conversation si elle n'existe pas
  if (!data.conversations[phoneNumber]) {
    data.conversations[phoneNumber] = {
      phone: phoneNumber,
      firstContact: new Date().toISOString(),
      messages: []
    };
  }

  // Ajouter le message
  data.conversations[phoneNumber].messages.push({
    role: role, // 'user' ou 'bot'
    message: message,
    timestamp: new Date().toISOString()
  });

  // Mettre à jour la date du dernier message
  data.conversations[phoneNumber].lastMessage = new Date().toISOString();

  // Sauvegarder
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Récupérer l'historique d'un numéro
function getHistory(phoneNumber) {
  const data = readAll();
  return data.conversations[phoneNumber] || null;
}

// Récupérer toutes les conversations (pour le dashboard)
function getAllConversations() {
  const data = readAll();
  return data.conversations;
}

// Stats globales
function getStats() {
  const data = readAll();
  const conversations = Object.values(data.conversations);
  const totalMessages = conversations.reduce((acc, conv) => acc + conv.messages.length, 0);
  return {
    totalConversations: conversations.length,
    totalMessages: totalMessages,
    lastActivity: conversations.length > 0
      ? conversations.sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage))[0].lastMessage
      : null
  };
}

init();

module.exports = { saveMessage, getHistory, getAllConversations, getStats };
