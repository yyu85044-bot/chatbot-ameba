const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const remainingSpan = document.getElementById('remaining');

let messageCount = 0;
const MAX_MESSAGES = 15;

// ローカルストレージから回数を読み込む
if (localStorage.getItem('messageCount')) {
    messageCount = parseInt(localStorage.getItem('messageCount'));
    updateRemaining();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // 回数制限チェック
    if (messageCount >= MAX_MESSAGES) {
        alert('利用回数の上限に達しました。');
        return;
    }
    
    // ユーザーメッセージを表示
    addMessage(message, 'user');
    userInput.value = '';
    
    // カウント増加
    messageCount++;
    localStorage.setItem('messageCount', messageCount);
    updateRemaining();
    
    // APIに送信
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (data.error) {
            addMessage('エラー: ' + data.error, 'bot');
        } else {
            addMessage(data.reply, 'bot');
        }
    } catch (error) {
        addMessage('通信エラーが発生しました。', 'bot');
    }
}

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.textContent = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateRemaining() {
    const remaining = MAX_MESSAGES - messageCount;
    remainingSpan.textContent = remaining;
    
    if (remaining <= 0) {
        sendBtn.disabled = true;
        userInput.disabled = true;
    }
}
