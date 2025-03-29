let hasGreeted = false;

function toggleChat() {
  const box = document.getElementById('chat-box');
  const isOpen = box.style.display === 'flex';
  box.style.display = isOpen ? 'none' : 'flex';

  if (!isOpen && !hasGreeted) {
    showBotGreeting();
    hasGreeted = true;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');

  if (input) {
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
  botWrap.style.alignItems = 'flex-end';

  const botAvatar = document.createElement('div');
  botAvatar.style.marginRight = '5px';
  botAvatar.style.fontSize = '18px';
  botAvatar.textContent = '👨‍🍳';

  const botBubble = document.createElement('div');
  botBubble.className = 'chat-bubble chat-bot';
  botBubble.innerText = 'Xin chào! Bạn cần giúp gì không?';

  botWrap.appendChild(botAvatar);
  botWrap.appendChild(botBubble);
  chatBody.appendChild(botWrap);
  chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');
  const message = input.value.trim();
  if (!message) return;

  const userWrap = document.createElement('div');
  userWrap.style.display = 'flex';
  userWrap.style.justifyContent = 'flex-end';
  userWrap.style.alignItems = 'flex-end';
  userWrap.innerHTML = `
    <div class="chat-bubble chat-user">${message}</div>
    <div style="margin-left: 5px; font-size: 18px;">👤</div>
  `;
  chatBody.appendChild(userWrap);
  chatBody.scrollTop = chatBody.scrollHeight;
  input.value = '';

  const typingWrap = document.createElement('div');
  typingWrap.id = 'typing';
  typingWrap.style.display = 'flex';
  typingWrap.style.alignItems = 'flex-end';
  typingWrap.innerHTML = `
    <div style="margin-right: 5px; font-size: 18px;">👨‍🍳</div>
    <div class="chat-bubble chat-bot"><em>Trợ lý đang trả lời...</em></div>
  `;
  chatBody.appendChild(typingWrap);
  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    typingWrap.remove();

    const botWrap = document.createElement('div');
    botWrap.style.display = 'flex';
    botWrap.style.alignItems = 'flex-start';

    const botAvatar = document.createElement('div');
    botAvatar.style.marginRight = '5px';
    botAvatar.style.fontSize = '18px';
    botAvatar.textContent = '👨‍🍳';

    const botBubble = document.createElement('div');
    botBubble.className = 'chat-bubble chat-bot';
    botBubble.innerHTML = data.reply || 'Xin lỗi, tôi không hiểu câu hỏi.';

    botWrap.appendChild(botAvatar);
    botWrap.appendChild(botBubble);
    chatBody.appendChild(botWrap);
    chatBody.scrollTop = chatBody.scrollHeight;

  } catch (err) {
    typingWrap.remove();
    const errorWrap = document.createElement('div');
    errorWrap.className = 'chat-bubble chat-bot';
    errorWrap.innerHTML = 'Lỗi: Không thể gửi tin nhắn.';
    chatBody.appendChild(errorWrap);
  }
}
