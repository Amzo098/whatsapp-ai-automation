// ================================
// DASHBOARD - LOGIQUE JS
// ================================

let allConversations = {};

// Charger les données au démarrage
async function loadData() {
  await loadStats();
  await loadConversations();
}

// Charger les statistiques
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const json = await res.json();
    const stats = json.data;

    document.getElementById('totalConversations').textContent = stats.totalConversations;
    document.getElementById('totalMessages').textContent = stats.totalMessages;

    if (stats.lastActivity) {
      const date = new Date(stats.lastActivity);
      document.getElementById('lastActivity').textContent =
        date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      document.getElementById('lastActivity').textContent = 'Aucune';
    }
  } catch (err) {
    console.error('Erreur chargement stats:', err);
  }
}

// Charger les conversations
async function loadConversations() {
  try {
    const res = await fetch('/api/conversations');
    const json = await res.json();
    allConversations = json.data;

    const list = document.getElementById('conversationsList');
    const conversations = Object.values(allConversations);

    if (conversations.length === 0) {
      list.innerHTML = `
        <div class="empty">
          <div class="icon">📭</div>
          <p>Aucune conversation pour l'instant.<br>En attente des premiers messages WhatsApp...</p>
        </div>
      `;
      return;
    }

    // Trier par date (plus récent en premier)
    conversations.sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage));

    list.innerHTML = conversations.map(conv => {
      const lastMsg = conv.messages[conv.messages.length - 1];
      const lastText = lastMsg ? lastMsg.message.substring(0, 60) + (lastMsg.message.length > 60 ? '...' : '') : '';
      const date = conv.lastMessage ? formatDate(conv.lastMessage) : '';

      return `
        <div class="conv-card" onclick="openConversation('${conv.phone}')">
          <div class="conv-avatar">👤</div>
          <div class="conv-info">
            <div class="conv-phone">${formatPhone(conv.phone)}</div>
            <div class="conv-last">${lastText}</div>
          </div>
          <div class="conv-meta">
            <div class="conv-count">${conv.messages.length} msgs</div>
            <div class="conv-date">${date}</div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Erreur chargement conversations:', err);
  }
}

// Ouvrir le détail d'une conversation
function openConversation(phone) {
  const conv = allConversations[phone];
  if (!conv) return;

  document.getElementById('modalTitle').textContent = `📱 ${formatPhone(phone)}`;

  const body = document.getElementById('modalBody');
  body.innerHTML = conv.messages.map(msg => `
    <div class="message ${msg.role}">
      <div class="message-bubble">${escapeHtml(msg.message)}</div>
      <div class="message-time">${msg.role === 'user' ? '👤 Client' : '🤖 Bot'} · ${formatDate(msg.timestamp)}</div>
    </div>
  `).join('');

  // Scroll vers le bas
  setTimeout(() => { body.scrollTop = body.scrollHeight; }, 100);

  document.getElementById('modal').classList.add('active');
}

// Fermer le modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

// Fermer modal en cliquant dehors
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Formater le numéro de téléphone
function formatPhone(phone) {
  return '+' + phone.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
}

// Formater la date
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'À l\'instant';
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
  return date.toLocaleDateString('fr-FR');
}

// Sécuriser le HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// Auto-refresh toutes les 30 secondes
setInterval(loadData, 30000);

// Chargement initial
loadData();
