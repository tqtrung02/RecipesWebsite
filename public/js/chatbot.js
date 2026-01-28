let hasGreeted = false;

function toggleChat() {
  const box = document.getElementById('chat-box');
  const isOpen = box.style.display === 'flex' || box.style.display === '';
  if (isOpen) {
    box.style.display = 'none';
  } else {
    // Ensure chat box is positioned correctly
    box.style.position = 'fixed';
    box.style.bottom = '100px';
    box.style.right = '24px';
    box.style.zIndex = '99999';
    box.style.display = 'flex';
    if (!hasGreeted) {
      showBotGreeting();
      hasGreeted = true;
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');

  if (input) {
    // Auto-resize textarea
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });

    // Send on Enter, new line on Shift+Enter
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});

function showBotGreeting() {
  const chatBody = document.getElementById('chat-body');

  const botWrap = document.createElement('div');
  botWrap.style.display = 'flex';
  botWrap.style.alignItems = 'flex-start';
  botWrap.style.marginBottom = '8px';

  const botBubble = document.createElement('div');
  botBubble.className = 'chat-bubble chat-bot';
  botBubble.innerText = 'Xin chào! 👋 Tôi là trợ lý nấu ăn. Tôi có thể giúp bạn tìm công thức nấu ăn. Bạn muốn tìm món gì hôm nay?';

  botWrap.appendChild(botBubble);
  chatBody.appendChild(botWrap);
  chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');
  const message = input.value.trim();
  if (!message) return;

  // Escape HTML to prevent XSS
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const userWrap = document.createElement('div');
  userWrap.style.display = 'flex';
  userWrap.style.justifyContent = 'flex-end';
  userWrap.style.alignItems = 'flex-end';
  userWrap.style.marginBottom = '8px';
  userWrap.innerHTML = `
    <div class="chat-bubble chat-user">${escapeHtml(message)}</div>
  `;
  chatBody.appendChild(userWrap);
  chatBody.scrollTop = chatBody.scrollHeight;
  input.value = '';
  
  // Auto-resize textarea
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';

  const typingWrap = document.createElement('div');
  typingWrap.id = 'typing';
  typingWrap.style.display = 'flex';
  typingWrap.style.alignItems = 'flex-start';
  typingWrap.style.marginBottom = '8px';
  typingWrap.innerHTML = `
    <div class="chat-bubble chat-bot">
      <em>Trợ lý đang trả lời...</em>
      <span style="display: inline-block; margin-left: 5px; animation: dots 1.5s steps(4, end) infinite;">...</span>
    </div>
  `;
  chatBody.appendChild(typingWrap);
  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    // Get API base URL from window object (set by Footer component) or use default
    const apiBaseUrl = window.API_BASE_URL || 
      (window.location.origin.includes('localhost:3000') 
        ? 'http://localhost:4000' 
        : window.location.origin.replace(':3000', ':4000'));
    
    const res = await fetch(`${apiBaseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    typingWrap.remove();

    const botWrap = document.createElement('div');
    botWrap.style.display = 'flex';
    botWrap.style.alignItems = 'flex-start';
    botWrap.style.marginBottom = '8px';

    const botBubble = document.createElement('div');
    botBubble.className = 'chat-bubble chat-bot';
    botBubble.innerHTML = data.reply || 'Xin lỗi, tôi không hiểu câu hỏi.';

    botWrap.appendChild(botBubble);
    chatBody.appendChild(botWrap);
    chatBody.scrollTop = chatBody.scrollHeight;

  } catch (err) {
    typingWrap.remove();
    const errorWrap = document.createElement('div');
    errorWrap.style.display = 'flex';
    errorWrap.style.alignItems = 'flex-start';
    errorWrap.style.marginBottom = '8px';
    
    const errorBubble = document.createElement('div');
    errorBubble.className = 'chat-bubble chat-bot';
    errorBubble.style.borderColor = '#dc3545';
    errorBubble.style.backgroundColor = '#fff5f5';
    errorBubble.innerHTML = '❌ Lỗi: Không thể gửi tin nhắn. Vui lòng thử lại sau.';
    
    errorWrap.appendChild(errorBubble);
    chatBody.appendChild(errorWrap);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}
